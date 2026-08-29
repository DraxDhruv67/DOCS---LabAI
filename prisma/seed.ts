import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAndSeed() {
  console.log('Clearing old duplicate test data...');

  // Delete all existing data in reverse order of foreign keys
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.sessionEntry.deleteMany();
  await prisma.practicalSession.deleteMany();
  await prisma.testCase.deleteMany();
  await prisma.practicalQuestion.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.subjectFacultyBatch.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.user.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.division.deleteMany();
  await prisma.studyYear.deleteMany();
  await prisma.department.deleteMany();
  await prisma.academicSession.deleteMany();

  console.log('Seeding fresh, clean DOCS V1 academic structure...');

  // 1. Current Academic Session
  const session2026 = await prisma.academicSession.create({
    data: {
      yearRange: '2026-2027',
      isCurrent: true,
    },
  });

  // 2. Main Department
  const deptCSE = await prisma.department.create({
    data: {
      code: 'CSE-DS',
      name: 'Computer Science & Engineering (Data Science)',
    },
  });

  // 3. Classes / Study Years
  const sySY = await prisma.studyYear.create({
    data: {
      name: 'SY',
      academicSessionId: session2026.id,
      departmentId: deptCSE.id,
    },
  });

  const syTY = await prisma.studyYear.create({
    data: {
      name: 'TY',
      academicSessionId: session2026.id,
      departmentId: deptCSE.id,
    },
  });

  // 4. Divisions & Batches under SY
  const divD = await prisma.division.create({
    data: {
      name: 'Division D',
      studyYearId: sySY.id,
    },
  });

  const batch1 = await prisma.batch.create({
    data: {
      name: 'Batch 1',
      divisionId: divD.id,
    },
  });

  const batch2 = await prisma.batch.create({
    data: {
      name: 'Batch 2',
      divisionId: divD.id,
    },
  });

  // 5. Standard Password Hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 6. Users (1 Admin, 1 Faculty, 1 Student)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@docs.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      name: 'System Admin',
      departmentId: deptCSE.id,
    },
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@docs.edu',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      name: 'Prof. Ananya Sharma',
      employeeId: 'FAC-101',
      departmentId: deptCSE.id,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@docs.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      name: 'Rohan V. Mehta',
      rollNo: '21DS05',
      departmentId: deptCSE.id,
      batchId: batch1.id,
    },
  });

  // 7. Rubric
  const defaultRubric = await prisma.rubric.create({
    data: {
      title: 'Standard Practical Evaluation Rubric',
      maxMarks: 10.0,
      criteriaJson: JSON.stringify([
        { category: 'Program Logic & Code Structure', marks: 5.0 },
        { category: 'Test Case Output Accuracy', marks: 3.0 },
        { category: 'Viva Voce & Understanding', marks: 2.0 },
      ]),
    },
  });

  // 8. Subject
  const mlSubject = await prisma.subject.create({
    data: {
      code: 'ML201',
      name: 'Machine Learning',
      departmentId: deptCSE.id,
      studyYearId: sySY.id,
      rubricId: defaultRubric.id,
    },
  });

  // 9. Faculty Subject Batch Allocation
  await prisma.subjectFacultyBatch.create({
    data: {
      subjectId: mlSubject.id,
      batchId: batch1.id,
      facultyId: facultyUser.id,
    },
  });

  // 10. Experiments & Questions (Clean named experiments)
  const exp1 = await prisma.experiment.create({
    data: {
      subjectId: mlSubject.id,
      experimentNo: 1,
      title: 'Experiment 1: Mean Squared Error (MSE) Calculation',
      description: 'Implement a function to calculate the Mean Squared Error between true and predicted values.',
    },
  });

  const exp2 = await prisma.experiment.create({
    data: {
      subjectId: mlSubject.id,
      experimentNo: 2,
      title: 'Experiment 2: Single Variable Linear Regression Gradient Descent',
      description: 'Implement weight updates for single-variable linear regression.',
    },
  });

  const q1 = await prisma.practicalQuestion.create({
    data: {
      experimentId: exp1.id,
      title: 'Calculate Mean Squared Error',
      description: 'Write a program that accepts space-separated numbers and computes the MSE.',
      difficulty: 'EASY',
      allowedLanguagesJson: JSON.stringify(['python', 'cpp', 'c', 'java']),
      marks: 10.0,
    },
  });

  await prisma.testCase.create({
    data: {
      questionId: q1.id,
      input: '1.0 2.0 3.0',
      expectedOutput: '1.0 2.0 3.0',
      isHidden: false,
    },
  });

  // 11. Timetable Slot
  await prisma.timetableSlot.create({
    data: {
      academicSessionId: session2026.id,
      departmentId: deptCSE.id,
      studyYearId: sySY.id,
      divisionId: divD.id,
      batchId: batch1.id,
      subjectId: mlSubject.id,
      facultyId: facultyUser.id,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '11:00',
      roomNo: 'Lab 302',
    },
  });

  console.log('Clean database reset & seed complete!');
}

resetAndSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
