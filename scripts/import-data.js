const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function importAll() {
  const backupPath = path.join(__dirname, '..', 'prisma', 'data-backup.json');
  if (!fs.existsSync(backupPath)) {
    console.error('[Data Import Error] prisma/data-backup.json does not exist. Run "npm run db:export" first.');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
  console.log('[Data Import] Restoring data in correct dependency order...');

  // 1. Academic Sessions
  for (const item of data.academicSessions || []) {
    await prisma.academicSession.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 2. Departments
  for (const item of data.departments || []) {
    await prisma.department.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 3. Study Years
  for (const item of data.studyYears || []) {
    await prisma.studyYear.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 4. Divisions
  for (const item of data.divisions || []) {
    await prisma.division.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 5. Batches
  for (const item of data.batches || []) {
    await prisma.batch.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 6. Users
  for (const item of data.users || []) {
    await prisma.user.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 7. Rubrics
  for (const item of data.rubrics || []) {
    await prisma.rubric.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 8. Subjects
  for (const item of data.subjects || []) {
    await prisma.subject.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 9. Faculty Allocations
  for (const item of data.subjectFacultyBatches || []) {
    await prisma.subjectFacultyBatch.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 10. Experiments
  for (const item of data.experiments || []) {
    await prisma.experiment.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 11. Practical Questions
  for (const item of data.practicalQuestions || []) {
    await prisma.practicalQuestion.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 12. Test Cases
  for (const item of data.testCases || []) {
    await prisma.testCase.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 13. Practical Sessions
  for (const item of data.practicalSessions || []) {
    await prisma.practicalSession.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 14. Session Entries
  for (const item of data.sessionEntries || []) {
    await prisma.sessionEntry.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 15. Attempts
  for (const item of data.attempts || []) {
    await prisma.attempt.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 16. Submissions
  for (const item of data.submissions || []) {
    await prisma.submission.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 17. Assignments
  for (const item of data.assignments || []) {
    await prisma.assignment.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 18. Assignment Submissions
  for (const item of data.assignmentSubmissions || []) {
    await prisma.assignmentSubmission.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 19. Resources
  for (const item of data.resources || []) {
    await prisma.resource.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 20. Timetable Slots
  for (const item of data.timetableSlots || []) {
    await prisma.timetableSlot.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 21. Notifications
  for (const item of data.notifications || []) {
    await prisma.notification.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  // 22. Audit Logs
  for (const item of data.auditLogs || []) {
    await prisma.auditLog.upsert({ where: { id: item.id }, update: {}, create: item });
  }

  console.log('[Data Import] Successfully imported and restored all records into the target database!');
}

importAll()
  .catch((err) => {
    console.error('[Data Import Error]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
