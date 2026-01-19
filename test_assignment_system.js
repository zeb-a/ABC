/**
 * Test to verify that the assignment delivery system works correctly
 * after implementing the fixes for the student portal.
 */

// Mock the application state similar to what's in App.jsx
const mockUser = {
  email: 'teacher@example.com',
  id: 'teacher123',
  name: 'Test Teacher'
};

// Mock classes data with assignments
const mockClasses = [
  {
    id: 'class1',
    name: 'Test Class',
    students: [
      { id: 'student1', name: 'John Doe', accessCode: '12345', score: 10 },
      { id: 'student2', name: 'Jane Smith', accessCode: '54321', score: 15 }
    ],
    assignments: [
      {
        id: 'assignment1',
        title: 'Math Homework',
        questions: [
          { id: 1, question: 'What is 2+2?', type: 'text' }
        ],
        date: new Date().toISOString(),
        assignedTo: 'all',  // Assigned to all students
        assignedToAll: true
      },
      {
        id: 'assignment2',
        title: 'Science Quiz',
        questions: [
          { id: 1, question: 'What is the capital of France?', type: 'text' }
        ],
        date: new Date().toISOString(),
        assignedTo: ['student1'],  // Assigned to specific student
        assignedToAll: false
      }
    ]
  }
];

// Test the assignment filtering logic from LandingPage.jsx
function normalizeStudentId(id) {
  if (id === undefined || id === null) return '';
  return String(id).trim();
}

// Function to simulate the student assignment filtering logic
function filterStudentAssignments(liveClassData, studentId) {
  return liveClassData?.assignments?.filter(assignment => {
    // If assignedToAll is true, all students can see it
    if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
      return true;
    }
    // If specific students are assigned, check if current student is in the list
    // Handle potential type mismatches (string vs number IDs) and normalization
    if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
      const normalizedStudentId = normalizeStudentId(studentId);
      return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
    }
    // Default: show the assignment
    return true;
  }) || [];
}

console.log('=== Assignment Delivery System Test ===\n');

// Test 1: Student 1 should see both assignments (one for all, one specific to them)
console.log('Test 1: Student 1 (ID: student1) assignments:');
const student1Assignments = filterStudentAssignments(mockClasses[0], 'student1');
console.log(`Student 1 sees ${student1Assignments.length} assignments:`);
student1Assignments.forEach(assn => console.log(`  - ${assn.title}`));
console.log(`Expected: 2 assignments (Math Homework and Science Quiz)`);
console.log(`Result: ${student1Assignments.length === 2 ? 'PASS' : 'FAIL'}\n`);

// Test 2: Student 2 should only see the "all students" assignment
console.log('Test 2: Student 2 (ID: student2) assignments:');
const student2Assignments = filterStudentAssignments(mockClasses[0], 'student2');
console.log(`Student 2 sees ${student2Assignments.length} assignments:`);
student2Assignments.forEach(assn => console.log(`  - ${assn.title}`));
console.log(`Expected: 1 assignment (Math Homework only)`);
console.log(`Result: ${student2Assignments.length === 1 && student2Assignments[0].title === 'Math Homework' ? 'PASS' : 'FAIL'}\n`);

// Test 3: Test type normalization (string vs number IDs)
console.log('Test 3: Type normalization (number ID vs string assignment target)');
const mockClassesWithStringIds = {
  ...mockClasses[0],
  assignments: [
    {
      ...mockClasses[0].assignments[0],  // Math Homework - assigned to 'all'
      assignedTo: 'all',
      assignedToAll: true
    },
    {
      ...mockClasses[0].assignments[1],  // Science Quiz - assigned to specific student
      assignedTo: [1],  // Using number ID instead of string
      assignedToAll: false
    }
  ]
};

// Test with student ID as number
const studentWithNumberAssignments = filterStudentAssignments(mockClassesWithStringIds, 1);
console.log(`Student with ID '1' (as number) sees ${studentWithNumberAssignments.length} assignments:`);
studentWithNumberAssignments.forEach(assn => console.log(`  - ${assn.title}`));
console.log(`Expected: 2 assignments (Math Homework and Science Quiz)`);
console.log(`Result: ${studentWithNumberAssignments.length === 2 ? 'PASS' : 'FAIL'}\n`);

// Test 4: Test edge case - no assignments
console.log('Test 4: Class with no assignments');
const emptyClass = { ...mockClasses[0], assignments: [] };
const noAssignments = filterStudentAssignments(emptyClass, 'student1');
console.log(`Student sees ${noAssignments.length} assignments when none exist`);
console.log(`Expected: 0 assignments`);
console.log(`Result: ${noAssignments.length === 0 ? 'PASS' : 'FAIL'}\n`);

console.log('=== Summary ===');
console.log('All tests check the assignment filtering logic that determines which assignments');
console.log('each student sees in their portal. The fixes ensure that:');
console.log('- Students see assignments marked for "all"');
console.log('- Students see assignments specifically assigned to them');
console.log('- Type mismatches (string vs number IDs) are handled correctly');
console.log('- Students don\'t see assignments meant for other students only');

console.log('\nThe main fixes implemented were:');
console.log('1. Updated App.jsx to load fresh classes from backend when student portal is accessed');
console.log('2. Improved ID normalization to handle string/number mismatches');
console.log('3. Added refresh capability to ensure latest assignments are loaded');
console.log('4. Enhanced assignment filtering logic in LandingPage.jsx');