import PocketBase from 'pocketbase';

// Use production PocketBase URL for Electron and production builds
const PRODUCTION_PB_URL = 'https://classabc.up.railway.app:8080';

const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
// In Electron (file:// protocol) or production, use the production PocketBase URL
const isElectron = typeof window !== 'undefined' && window.location.protocol === 'file:';
const pbUrl = isElectron ? PRODUCTION_PB_URL : `${origin}/api`;
const pb = new PocketBase(pbUrl);

// Auto-authentication refresh
pb.autoCancellation(false);

// Create api object that extends PocketBase with custom methods
const api = Object.create(pb);

// Auth helpers
api.login = async ({ email, password }) => {
  const resp = await pb.collection('_pb_users_auth_').authWithPassword(email, password);
  return {
    token: resp.token,
    user: resp.record
  };
};

api.register = async (email, password, passwordConfirm) => {
  return await pb.collection('_pb_users_auth_').create({
    email,
    password,
    passwordConfirm,
  });
};

api.logout = () => {
  pb.authStore.clear();
};

api.setToken = (token) => {
  pb.authStore.save(token, null);
};

api.getCurrentUser = () => {
  return pb.authStore.model;
};

api.isAuthenticated = () => {
  return pb.authStore.isValid;
};

// Data helpers
api.getRecords = async (collection, options = {}) => {
  return await pb.collection(collection).getList(options.page || 1, options.perPage || 20, options);
};

api.getRecord = async (collection, id) => {
  return await pb.collection(collection).getOne(id);
};

api.createRecord = async (collection, data) => {
  return await pb.collection(collection).create(data);
};

api.updateRecord = async (collection, id, data) => {
  return await pb.collection(collection).update(id, data);
};

api.deleteRecord = async (collection, id) => {
  return await pb.collection(collection).delete(id);
};

// Get classes for a user
api.getClasses = async (email) => {
  try {
    const existing = await pb.collection('classes').getList(1, 500);
    const userClasses = (existing.items || []).filter(c => c.teacher === email);

    // Helper for safe JSON parsing
    const safeParse = (str, defaultValue) => {
      try {
        if (!str || str === '') return defaultValue;
        return JSON.parse(str);
      } catch (e) {
        console.warn('[API] Failed to parse JSON:', str, 'Error:', e.message);
        return defaultValue;
      }
    };

    // Parse JSON fields for each class
    return userClasses.map(c => ({
      id: c.id,
      name: c.name,
      teacher: c.teacher,
      students: safeParse(c.students, []),
      tasks: safeParse(c.tasks, []),
      assignments: safeParse(c.assignments, []),
      submissions: safeParse(c.submissions, []),
      studentAssignments: safeParse(c.studentAssignments, []),
      student_submissions: safeParse(c.student_submissions, []),
      Access_Codes: c.Access_Codes || {},
      avatar: c.avatar,
      stats: c.stats || { stars: 0, eggs: 0 }
    }));
  } catch (err) {
    console.error('[API] Get classes error:', err.message);
    return [];
  }
};

// Save classes to backend
api.saveClasses = async (email, arr, behaviorsForTasks = []) => {
  try {
    // Get existing classes for this teacher
    const existing = await pb.collection('classes').getList(1, 500);
    const userClasses = (existing.items || []).filter(c => c.teacher === email);

    // Create maps by both ID and name for matching
    const byId = new Map(userClasses.map(c => [c.id, c]));
    const byName = new Map(userClasses.map(c => [c.name, c]));

    const processedIds = new Set();

    // Helper to check JSON size (PocketBase limit is 1MB = 1048576 bytes)
    function isTooLarge(obj) {
      try {
        return JSON.stringify(obj).length > 900000; // Use 900KB for safety
      } catch {
        return false;
      }
    }

    // Process each incoming class
    for (const cls of arr) {
      // Trim assignments/students if too large
      let assignments = Array.isArray(cls.assignments) ? [...cls.assignments] : [];
      let students = Array.isArray(cls.students) ? [...cls.students] : [];
      // Remove large fields from assignments if needed
      if (isTooLarge(assignments)) {
        assignments = assignments.slice(0, 100); // Only keep first 100
      }
      if (isTooLarge(students)) {
        students = students.slice(0, 200); // Only keep first 200
      }

      const assignmentsJson = JSON.stringify(assignments);
      const updatePayload = {
        name: cls.name,
        teacher: email,
        students: JSON.stringify(students),
        tasks: JSON.stringify(behaviorsForTasks),
        assignments: assignmentsJson,
        submissions: JSON.stringify(cls.submissions || []),
        studentAssignments: JSON.stringify(cls.studentAssignments || []),
        student_submissions: JSON.stringify(cls.student_submissions || []),
        Access_Codes: cls.Access_Codes || {}
      };

      // Try to match by PocketBase ID first, then by name
      let serverRecord = null;
      let pbId = null;

      if (cls.id && byId.has(cls.id)) {
        serverRecord = byId.get(cls.id);
        pbId = cls.id;
      } else if (byName.has(cls.name)) {
        serverRecord = byName.get(cls.name);
        pbId = serverRecord.id;
      }

      if (serverRecord && pbId) {
        processedIds.add(pbId);
        try {
          await pb.collection('classes').update(pbId, updatePayload);
        } catch (e) {
          console.error('[API] Update failed for class:', cls.name, 'Error:', e.message, e.body);
        }
      } else {
        try {
          const created = await pb.collection('classes').create(updatePayload);
          processedIds.add(created.id);
        } catch (e) {
          console.error('[API] Create failed for class:', cls.name, 'Error:', e.message);
        }
      }
    }

    // Delete records that are not in incoming array
    for (const [id, item] of byId) {
      if (!processedIds.has(id)) {
        try {
          await pb.collection('classes').delete(id);
        } catch (e) {
          console.error('[API] Delete failed for class ID:', id, 'Error:', e.message);
        }
      }
    }

    return arr;
  } catch (err) {
    console.error('[API] Save error:', err.message);
    throw err;
  }
};

// Save behaviors for a class
api.saveBehaviors = async (classId, behaviors) => {
  try {
    const res = await pb.collection('behaviors').getList(1, 500, {
      filter: `class="${classId}"`
    });
    const existingMap = new Map((res.items || []).map(i => [i.label, i]));
    const results = [];

    for (const behavior of behaviors) {
      // Always send type as a string (first value if array, or fallback to 'wow')
      const behaviorType = Array.isArray(behavior.type) ? (behavior.type[0] || 'wow') : (behavior.type || 'wow');

      const payload = {
        label: behavior.label,
        pts: Number(behavior.pts) || 0,
        type: behaviorType,
        icon: behavior.icon,
        class: classId || ''
      };

      const existing = existingMap.get(behavior.label);
      // Only send string for type, never array
      if (existing) {
        try {
          results.push(await pb.collection('behaviors').update(existing.id, payload));
        } catch (e) {
          console.error('[API] Update failed for behavior:', behavior.label, e.message);
        }
      } else {
        try {
          results.push(await pb.collection('behaviors').create(payload));
        } catch (e) {
          console.error('[API] Create failed for behavior:', behavior.label, e.message);
        }
      }
    }
    return results;
  } catch (err) {
    console.error('[API] Save behaviors error:', err.message);
    // Don't throw, just log the error so the app continues to work
    return [];
  }
};

export default api;
