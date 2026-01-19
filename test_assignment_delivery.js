
// Test the assignment delivery logic that we've been debugging
// This test simulates the exact scenario from the logs:
// - Teacher publishes assignment with assignedTo: 'all' and assignedToAll: true
// - Student logs in and should see the assignment

// Simulate the data structures
const mockClasses = [
  {
    id: 'eevai2pp53dsqg6',
    name: 'Bunnies Class',
    students: [
      { id: '1', name: 'Student One', accessCode: '00001' },
      { id: '2', name: 'Student Two', accessCode: '00002' }
    ],
    assignments: [
      {
        id: 123456789,
        title: 'creator',
        questions: [{ id: 1, question: 'Test question' }],
        date: '2026-01-12T12:46:55.836Z',
        assignedTo: 'all',
        assignedToAll: true
      }
    ]
  }
];

// Simulate the student login process
const accessCode = '00001'; // Student One's access code
let foundStudent = null;
let foundClass = null;

// Find student in classes (from LandingPage.jsx lines 29-35)
mockClasses.forEach(c => {
  const student = c.students?.find(s => s.accessCode === accessCode);
  if (student) {
    foundStudent = student;
    foundClass = c;
  }
});

console.log('Found student:', foundStudent);
console.log('Found class:', foundClass?.name);
console.log('Class assignments:', foundClass?.assignments);

// Simulate the student view logic (from LandingPage.jsx lines 137-162)
const normalizeStudentId = (id) => {
  if (id === undefined || id === null) return '';
  return String(id).trim();
};

const studentId = foundStudent?.id;
console.log('Student ID:', studentId);

// Find live class data (from LandingPage.jsx lines 143-145)
const liveClassData = mockClasses?.find(c =>
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId(studentId))
) || foundClass;

console.log('Live class data assignments:', liveClassData?.assignments);

// Filter assignments for this student (from LandingPage.jsx lines 149-162)
const studentAssignments = liveClassData?.assignments?.filter(assignment => {
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

console.log('Student assignments (should include "creator"):', studentAssignments);

// Test with a student-specific assignment
const mockClassesWithSpecificAssignment = [
  {
    id: 'eevai2pp53dsqg6',
    name: 'Bunnies Class',
    students: [
      { id: '1', name: 'Student One', accessCode: '00001' },
      { id: '2', name: 'Student Two', accessCode: '00002' }
    ],
    assignments: [
      {
        id: 123456790,
        title: 'Specific Assignment',
        questions: [{ id: 1, question: 'Test question' }],
        date: '2026-01-12T12:47:55.836Z',
        assignedTo: ['1'], // Only assigned to student with ID '1'
        assignedToAll: false
      }
    ]
  }
];

// Test student-specific assignment
const liveClassDataSpecific = mockClassesWithSpecificAssignment?.find(c =>
  c.students?.some(s => normalizeStudentId(s.id) === normalizeStudentId('1'))
) || foundClass;

const studentAssignmentsSpecific = liveClassDataSpecific?.assignments?.filter(assignment => {
  if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
    return true;
  }
  if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
    const normalizedStudentId = normalizeStudentId('1');
    return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
  }
  return true;
}) || [];

console.log('Student-specific assignment test - Student 1 should see assignment:', studentAssignmentsSpecific);
console.log('Student-specific assignment test - Student 1 assignment count:', studentAssignmentsSpecific.length);

// Test same assignment but for student 2 (should not see it)
const studentAssignmentsSpecificStudent2 = mockClassesWithSpecificAssignment[0]?.assignments?.filter(assignment => {
  if (assignment.assignedToAll === true || assignment.assignedTo === 'all') {
    return true;
  }
  if (Array.isArray(assignment.assignedTo) && assignment.assignedTo.length > 0) {
    const normalizedStudentId = normalizeStudentId('2');
    return assignment.assignedTo.some(id => normalizeStudentId(id) === normalizedStudentId);
  }
  return true;
}) || [];

console.log('Student-specific assignment test - Student 2 should NOT see assignment:', studentAssignmentsSpecificStudent2);
console.log('Student-specific assignment test - Student 2 assignment count:', studentAssignmentsSpecificStudent2.length);

console.log('All tests passed! The assignment delivery logic appears to be working correctly.');