const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DOCS V1 database...');

  // Hash default passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Create Academic Session
  const session = await prisma.academicSession.upsert({
    where: { yearRange: '2026-2027' },
    update: { isCurrent: true },
    create: {
      yearRange: '2026-2027',
      isCurrent: true,
    },
  });

  // 2. Create Department
  const dept = await prisma.department.upsert({
    where: { code: 'CSE-DS' },
    update: {},
    create: {
      code: 'CSE-DS',
      name: 'Computer Science & Engineering (Data Science)',
    },
  });

  // 3. Create Study Year
  const studyYear = await prisma.studyYear.create({
    data: {
      name: 'SY',
      academicSessionId: session.id,
      departmentId: dept.id,
    },
  });

  // 4. Create Division
  const division = await prisma.division.create({
    data: {
      name: 'Division D',
      studyYearId: studyYear.id,
    },
  });

  // 5. Create Batches
  const batch1 = await prisma.batch.create({
    data: {
      name: 'Batch 1',
      divisionId: division.id,
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      name: 'Batch 2',
      divisionId: division.id,
    },
  });

  // 6. Create Default Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@docs.edu' },
    update: {},
    create: {
      email: 'admin@docs.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'System Admin',
      employeeId: 'ADM001',
      departmentId: dept.id,
    },
  });

  // 7. Create Default Faculty User
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@docs.edu' },
    update: {},
    create: {
      email: 'faculty@docs.edu',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      name: 'Dr. Alan Turing',
      employeeId: 'FAC101',
      departmentId: dept.id,
    },
  });

  // 8. Create Default Student User
  const student = await prisma.user.upsert({
    where: { email: 'student@docs.edu' },
    update: {},
    create: {
      email: 'student@docs.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      name: 'Ada Lovelace',
      rollNo: '21DS01',
      departmentId: dept.id,
      batchId: batch1.id,
    },
  });

  // 9. Create Rubric
  const rubric = await prisma.rubric.create({
    data: {
      title: 'Standard Practical Rubric',
      maxMarks: 10.0,
      criteriaJson: JSON.stringify([
        { category: 'Program Logic & Code Structure', marks: 5.0 },
        { category: 'Test Case Output & Execution', marks: 3.0 },
        { category: 'Viva & Understanding', marks: 2.0 },
      ]),
    },
  });

  // 10. Create Subject
  const subject = await prisma.subject.create({
    data: {
      code: 'ML201',
      name: 'Machine Learning',
      departmentId: dept.id,
      studyYearId: studyYear.id,
      rubricId: rubric.id,
    },
  });

  // 11. Assign Faculty in-charge to Subject & Batch
  await prisma.subjectFacultyBatch.create({
    data: {
      subjectId: subject.id,
      batchId: batch1.id,
      facultyId: faculty.id,
    },
  });

  // 12. Create Experiment
  const exp1 = await prisma.experiment.create({
    data: {
      subjectId: subject.id,
      experimentNo: 1,
      title: 'Linear Regression & Cost Function Implementation',
      description: 'Implement Gradient Descent algorithm for simple linear regression from scratch.',
      labManualUrl: '/uploads/manuals/exp1_linear_regression.pdf',
    },
  });

  // 13. Create Practical Question with Test Cases
  const question1 = await prisma.practicalQuestion.create({
    data: {
      experimentId: exp1.id,
      title: 'Calculate Mean Squared Error (MSE)',
      description: 'Write a function that accepts two arrays: actual y values and predicted y_pred values, and returns the Mean Squared Error formatted to 4 decimal places.',
      difficulty: 'EASY',
      allowedLanguagesJson: JSON.stringify(['python', 'c', 'cpp', 'java']),
      defaultCodeJson: JSON.stringify({
        python: 'def calculate_mse(y_true, y_pred):\n    # Write code here\n    pass\n\nif __name__ == "__main__":\n    import sys\n    lines = sys.stdin.read().splitlines()\n    if lines:\n        y1 = list(map(float, lines[0].split()))\n        y2 = list(map(float, lines[1].split()))\n        print(f"{calculate_mse(y1, y2):.4f}")',
        cpp: '#include <iostream>\n#include <vector>\n#include <cmath>\n#include <iomanip>\nusing namespace std;\n\ndouble calculateMSE(const vector<double>& y_true, const vector<double>& y_pred) {\n    // Write code here\n    return 0.0;\n}\n\nint main() {\n    return 0;\n}',
      }),
      marks: 10.0,
    },
  });

  await prisma.testCase.createMany({
    data: [
      {
        questionId: question1.id,
        input: '1.0 2.0 3.0\n1.0 2.0 3.0',
        expectedOutput: '0.0000',
        isHidden: false,
      },
      {
        questionId: question1.id,
        input: '2.0 4.0 6.0\n1.0 3.0 5.0',
        expectedOutput: '1.0000',
        isHidden: false,
      },
      {
        questionId: question1.id,
        input: '10.5 20.0 30.5\n9.5 21.0 29.5',
        expectedOutput: '1.0000',
        isHidden: true,
      },
    ],
  });

  // 14. Create Timetable Slot
  await prisma.timetableSlot.create({
    data: {
      academicSessionId: session.id,
      departmentId: dept.id,
      studyYearId: studyYear.id,
      divisionId: division.id,
      batchId: batch1.id,
      subjectId: subject.id,
      facultyId: faculty.id,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '11:00',
      roomNo: 'Data Science Lab 302',
    },
  });

  // 15. Create Initial Notification
  await prisma.notification.create({
    data: {
      userId: student.id,
      title: 'Welcome to DOCS V1',
      message: 'Your practical workspace and subject enrollments are ready.',
      type: 'INFO',
      read: false,
    },
  });

  console.log('Database seeding complete successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
