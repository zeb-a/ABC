/**
 * Migration script to add IDs to existing assignments in PocketBase
 *
 * This script will:
 * 1. Fetch all classes from PocketBase
 * 2. For each class, check assignments array
 * 3. Add unique IDs to any assignments missing an ID field
 * 4. Update the class in PocketBase
 */

import PocketBase from 'pocketbase/cjs';
const pb = new PocketBase('http://127.0.0.1:8090');

async function migrateAssignmentIds() {
  try {
    // Authenticate with the admin user
    const authData = await pb.collection('users').authWithPassword(
      'admin@example.com',
      'admin123456'
    );
    console.log('✓ Authenticated as admin');

    // Fetch all classes
    const result = await pb.collection('classes').getList(1, 500);
    console.log(`✓ Found ${result.items.length} classes`);

    let updatedCount = 0;
    let assignmentsFixed = 0;

    for (const cls of result.items) {
      let assignments = [];
      try {
        assignments = typeof cls.assignments === 'string'
          ? JSON.parse(cls.assignments)
          : cls.assignments || [];
      } catch (e) {
        console.error(`Error parsing assignments for class ${cls.id}:`, e);
        continue;
      }

      if (!Array.isArray(assignments)) {
        console.warn(`Class ${cls.name} (${cls.id}) has non-array assignments, skipping`);
        continue;
      }

      let hasChanges = false;
      const processedAssignments = assignments.map((asm, idx) => {
        if (!asm || typeof asm !== 'object') return asm;

        // Check if assignment is missing ID or has invalid ID
        if (!asm.id || asm.id === undefined || asm.id === null) {
          // Generate a unique ID based on title + index + timestamp
          const baseId = asm.title || `assignment_${idx}`;
          const newId = `${baseId}_${Date.now()}`;
          hasChanges = true;
          assignmentsFixed++;
          return { ...asm, id: newId };
        }

        return asm;
      });

      if (hasChanges) {
        console.log(`  -> Fixing ${assignments.filter(a => !a.id || a.id === undefined).length} assignments in "${cls.name}"`);

        await pb.collection('classes').update(cls.id, {
          assignments: JSON.stringify(processedAssignments)
        });
        updatedCount++;
      }
    }

    console.log(`\n✓ Migration complete:`);
    console.log(`  - Updated ${updatedCount} classes`);
    console.log(`  - Fixed ${assignmentsFixed} assignments`);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateAssignmentIds();
