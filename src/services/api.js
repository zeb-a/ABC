// api.js
const base = (() => {
  // Always use the environment variable if set
  if (import.meta.env.VITE_BACKEND_URL) {
    const url = import.meta.env.VITE_BACKEND_URL;
    // Ensure /api is in the URL
    if (!url.includes('/api')) {
      return url.replace(/\/$/, '') + '/api';
    }
    return url;
  }

  if (import.meta.env.DEV) {
    // Dev mode: use relative path (proxied by Vite)
    return '/api';
  }

  // Production: use full URL to PocketBase
  return 'localhost:4002/api';
})();

function getToken() {
  return localStorage.getItem('class123_pb_token') || null;
}

async function pbRequest(path, opts = {}) {
  const url = `${base.replace(/\/$/, '')}${path}`;
  const headers = opts.headers || {};
  const token = getToken();
  if (token) headers['Authorization'] = token;
  opts.headers = { 'Content-Type': 'application/json', ...headers };
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `request-failed:${res.status}`);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

// --- EXPORT DEFAULT OBJECT ---
export default {
  pbRequest, // <--- ADD THIS LINE

  async ping() {
    try {
      return await pbRequest('/health');
    } catch {
      return { ok: false };
    }
  },
async getStudentByParentCode(code) {
    try {
        // Fetch all classes from the database
        const response = await pbRequest('/collections/classes/records');
        const classes = response.items || [];
        
        for (const cls of classes) {
            const accessCodes = typeof cls.Access_Codes === 'string' ? JSON.parse(cls.Access_Codes) : cls.Access_Codes;
            
            if (accessCodes) {
                // Find the student ID that has this parent code
                const studentId = Object.keys(accessCodes).find(id => accessCodes[id].parentCode === code);
                
                if (studentId) {
                    const students = typeof cls.students === 'string' ? JSON.parse(cls.students) : cls.students;
                    const student = students.find(s => s.id.toString() === studentId.toString());
                    
                    return {
                        studentId: studentId,
                        studentName: student?.name,
                        classData: cls
                    };
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Search error", e);
        return null;
    }
},
// Inside export default { ... } in api.js

  async getStudentByCode(code, type) {
    const fieldName = type === 'parent' ? 'parentCode' : 'studentCode';
    try {
      // 1. Fetch all classes from the database
      const res = await pbRequest('/collections/classes/records?perPage=500');
      const classes = res.items || [];
      
      for (const cls of classes) {
        // 2. Parse the Access_Codes JSON
        const accessCodes = typeof cls.Access_Codes === 'string' 
          ? JSON.parse(cls.Access_Codes || '{}') 
          : (cls.Access_Codes || {});
        
        // 3. Look for a student ID that matches the 5-digit code
        const studentId = Object.keys(accessCodes).find(id => accessCodes[id][fieldName] === code);
        
        if (studentId) {
          // 4. If found, get the student details and return the data
          const students = typeof cls.students === 'string' 
            ? JSON.parse(cls.students || '[]') 
            : (cls.students || []);
            
          const student = students.find(s => s.id.toString() === studentId.toString());
          
          return {
            studentId: studentId,
            studentName: student?.name || 'Student',
            classData: {
              ...cls,
              students: students,
              tasks: typeof cls.tasks === 'string' ? JSON.parse(cls.tasks || '[]') : (cls.tasks || []),
              Access_Codes: accessCodes
            }
          };
        }
      }
      // Return null if no match found
      return null;
    } catch (err) {
      console.error("[API] Portal login error:", err);
      throw err;
    }
  },
  async register({ email, password, name }) {
    const user = await pbRequest('/collections/users/records', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        passwordConfirm: password,
        name: name || email
      })
    });

    // Request email verification
    try {
      await pbRequest('/collections/users/request-verification', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    } catch (e) {
      // ...existing code...
    }

    return {
      user: { email: user.email, name: user.name, id: user.id },
      message: 'Account created! Please check your email to verify your account.'
    };
  },

  async login({ email, password }) {
    const auth = await pbRequest('/collections/users/auth-with-password', {
      method: 'POST',
      body: JSON.stringify({ identity: email, password })
    });

    // For now, allow login regardless of verification status
    // PocketBase uses 'verified' field, not 'emailVerified'
    // if (!auth.record?.verified) {
    //   const err = new Error('Email not verified');
    //   err.status = 403;
    //   err.body = { message: 'Please verify your email first.' };
    //   throw err;
    // }

    if (auth.token) {
      localStorage.setItem('class123_pb_token', auth.token);
    }
    return { user: { email: auth.record.email, name: auth.record.name, id: auth.record.id }, token: auth.token };
  },

  async forgotPassword(email) {
    return await pbRequest('/collections/users/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async verifyEmail(token) {
    return await pbRequest('/collections/users/confirm-verification', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  },

  async updateProfile({ id, name, avatar, password, oldPassword }) {
    const token = getToken();
    if (!token) throw new Error('not_authenticated');
    if (!id) throw new Error('user_id_missing');

    // Use FormData for file uploads (avatar is a file field in PocketBase)
    const formData = new FormData();

    if (name && name.trim()) {
      formData.append('name', name.trim());
    }

    // Handle avatar file upload
    // Check if avatar is a base64 data URL (uploaded image)
if (avatar && avatar.startsWith('data:image')) {
      // Convert data URL to Blob
      try {
        const response = await fetch(avatar);
        const blob = await response.blob();

        // Check file size
        if (blob.size > 5 * 1024 * 1024) {
          throw new Error('Image is too large (max 5MB)');
        }

        // Append as file
        formData.append('avatar', blob, 'avatar.png');
      } catch (err) {
        console.warn('[API] Could not process avatar:', err.message);
        // Continue without avatar update
      }
    }

    // Handle password change
    if (password && password.trim() && oldPassword && oldPassword.trim()) {
      formData.append('password', password.trim());
      formData.append('passwordConfirm', password.trim());
      formData.append('oldPassword', oldPassword.trim());
    } else if (password && password.trim() && !oldPassword) {
      throw new Error('Current password required to change password');
    }

    // ...existing code...

    // Update user with FormData (for file upload support)
    try {
      const url = `${base.replace(/\/$/, '')}/collections/users/records/${id}`;
      const requestToken = getToken();
      const headers = {};
      if (requestToken) headers['Authorization'] = requestToken;

      const res = await fetch(url, {
        method: 'PATCH',
        headers,
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const err = new Error(data.message || `request-failed:${res.status}`);
        err.status = res.status;
        err.body = data;
        throw err;
      }

      // Construct proper avatar URL if it's a filename
      let avatarUrl = data.avatar;
      if (data.avatar && !data.avatar.startsWith('http') && !data.avatar.startsWith('')) {
        // It's a filename, construct the full URL
        const baseUrl = base.replace(/\/api$/, '');
        // Add a timestamp (?t=...) to bypass browser cache so the new image shows immediately
avatarUrl = `${baseUrl}/api/files/users/${data.id}/${data.avatar}?t=${Date.now()}`;
      }

      // ...existing code...
      return { user: { email: data.email, name: data.name, avatar: avatarUrl, id: data.id } };
    } catch (err) {
      console.error('[API] Profile update failed:', err.message);
      console.error('[API] Error body:', err.body);
      throw err;
    }
  },

// --- Behaviors (Select Multiple Support) ---
  async getBehaviors(classId) {
    const res = await pbRequest(`/collections/behaviors/records?filter=class="${classId}"&perPage=500`);
    return (res.items || []).map(b => ({
      ...b,
      // Keep as array for frontend consistency if needed
      type: Array.isArray(b.type) ? b.type : [b.type]
    }));
  },

  async saveBehaviors(classId, behaviors) {
    const res = await pbRequest(`/collections/behaviors/records?filter=class="${classId}"&perPage=500`);
    const existingMap = new Map((res.items || []).map(i => [i.label, i]));
    const results = [];

    for (const behavior of behaviors) {
      // FIX: Since your field is "Select Multiple", PocketBase REQUIRES an array.
      // We ensure it is sent as ['wow'] or ['nono']
      const behaviorTypeArray = Array.isArray(behavior.type) 
        ? behavior.type 
        : [behavior.type || 'wow'];
      
      const payload = {
        label: behavior.label,
        pts: behavior.pts,
        type: behaviorTypeArray, // Sending as Array
        icon: behavior.icon,
        class: classId
      };

      const existing = existingMap.get(behavior.label);
      if (existing) {
        results.push(await pbRequest(`/collections/behaviors/records/${existing.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        }));
      } else {
        results.push(await pbRequest('/collections/behaviors/records', {
          method: 'POST',
          body: JSON.stringify(payload)
        }));
      }
    }
    return results;
  },

  // --- HANDLES 'classes' COLLECTION (students & tasks) ---
  async getClasses(email) {
    try {
      const res = await pbRequest('/collections/classes/records?perPage=500');
      const classes = (res.items || []).filter(c => c.teacher === email);

      // Parse JSON fields if they're strings
      return classes.map(c => ({
        ...c,
        students: typeof c.students === 'string' ? JSON.parse(c.students || '[]') : (c.students || []),
        tasks: typeof c.tasks === 'string' ? JSON.parse(c.tasks || '[]') : (c.tasks || []), // Parse tasks JSON
        assignments: typeof c.assignments === 'string' ? JSON.parse(c.assignments || '[]') : (c.assignments || []), // Parse assignments JSON
        submissions: typeof c.submissions === 'string' ? JSON.parse(c.submissions || '[]') : (c.submissions || []), // Parse submissions JSON
        studentAssignments: typeof c.studentAssignments === 'string' ? JSON.parse(c.studentAssignments || '[]') : (c.studentAssignments || []), // Parse student assignments JSON
        student_submissions: typeof c.student_submissions === 'string' ? JSON.parse(c.student_submissions || '[]') : (c.student_submissions || []), // Parse student submissions JSON
        Access_Codes: typeof c.Access_Codes === 'string' ? JSON.parse(c.Access_Codes || '{}') : (c.Access_Codes || {})
        
      }));
    } catch (err) {
      console.error('[CLASSES] Load error:', err.message);
      throw err;
    }
  },

  // --- MODIFIED: Saves class data, including students and tasks (from behaviors) ---
  // 'behaviorsForTasks' should be passed from the calling component (e.g., App.jsx)
  async saveClasses(email, arr, behaviorsForTasks = []) { // Added behaviorsForTasks parameter
    try {
      // Get existing classes for this teacher
      const existing = await pbRequest('/collections/classes/records?perPage=500');
      const userClasses = (existing.items || []).filter(c => c.teacher === email);

      // Create maps by both ID and name for matching
      const byId = new Map(userClasses.map(c => [c.id, c]));
      const byName = new Map(userClasses.map(c => [c.name, c]));

      // ...existing code...

      const processedIds = new Set();

      // Process each incoming class
      for (const cls of arr) {
        // Try to match by PocketBase ID first, then by name
        let serverRecord = null;
        let pbId = null;

        if (cls.id && byId.has(cls.id)) {
          serverRecord = byId.get(cls.id);
          pbId = cls.id;
        } else if (byName.has(cls.name)) {
          // Fall back to name matching for classes created locally
          serverRecord = byName.get(cls.name);
          pbId = serverRecord.id;
        }

        if (serverRecord && pbId) {
          processedIds.add(pbId);
          try {
            // ...existing code...
            const updatePayload = {
              name: cls.name,
              teacher: email,
              students: JSON.stringify(cls.students || []), // Serialize students to JSON
              tasks: JSON.stringify(behaviorsForTasks),      // Serialize behaviors to 'tasks' JSON
              assignments: JSON.stringify(cls.assignments || []), // Serialize assignments to JSON
              submissions: JSON.stringify(cls.submissions || []), // Serialize submissions to JSON
              studentAssignments: JSON.stringify(cls.studentAssignments || []), // Serialize student assignments to JSON
              student_submissions: JSON.stringify(cls.student_submissions || []), // Serialize student submissions to JSON
              Access_Codes: cls.Access_Codes || {}
            };

            await pbRequest(`/collections/classes/records/${pbId}`, {
              method: 'PATCH',
              body: JSON.stringify(updatePayload)
            });
            // ...existing code...
          } catch (e) {
            console.error('[API] Update failed for class:', cls.name, 'Error:', e.message, e.body);
            // Continue with next class instead of throwing
          }
        } else {
          // Create new ONLY if class has no ID
          try {
            // ...existing code...
            const created = await pbRequest('/collections/classes/records', {
              method: 'POST',
              body: JSON.stringify({
                name: cls.name,
                teacher: email,
                students: JSON.stringify(cls.students || []), // Serialize students to JSON
                tasks: JSON.stringify(behaviorsForTasks),      // Serialize behaviors to 'tasks' JSON
                assignments: JSON.stringify(cls.assignments || []), // Serialize assignments to JSON
                submissions: JSON.stringify(cls.submissions || []), // Serialize submissions to JSON
                studentAssignments: JSON.stringify(cls.studentAssignments || []), // Serialize student assignments to JSON
                student_submissions: JSON.stringify(cls.student_submissions || []) // Serialize student submissions to JSON              
                })
            });
            processedIds.add(created.id);
            // ...existing code...
          } catch (e) {
            console.error('[API] Create failed for class:', cls.name, 'Error:', e.message);
          }
        }
      }

      // Delete records that are not in the incoming array
      for (const [id, item] of byId) {
        if (!processedIds.has(id)) {
          // ...existing code...
          try {
            await pbRequest(`/collections/classes/records/${id}`, { method: 'DELETE' });
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
  },

  async deleteNewCards() {
    try {
      let deleted = 0;
      let page = 1;
      const perPage = 500;

      // Loop through all pages of "New Card" entries and delete them
      while (true) {
        const response = await pbRequest(
          `/collections/behaviors/records?filter=label="New Card"&perPage=${perPage}&page=${page}`
        );
        const items = response.items || [];

        if (items.length === 0) break; // No more items

        // Delete each one
        for (const item of items) {
          try {
            await pbRequest(`/collections/behaviors/records/${item.id}`, { method: 'DELETE' });
            deleted++;
          } catch (e) {
            console.warn('Failed to delete card:', item.id, e.message);
          }
        }

        page++;
      }

      return deleted;
    } catch (err) {
      console.error('deleteNewCards error:', err);
      throw err;
    }
  },

  setToken(token) {
    if (token) localStorage.setItem('class123_pb_token', token);
    else localStorage.removeItem('class123_pb_token');
  }
};