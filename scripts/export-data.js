const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportAll() {
  console.log('[Data Export] Reading all records from current database...');

  const data = {
    academicSessions: await prisma.academicSession.findMany(),
    departments: await prisma.department.findMany(),
    studyYears: await prisma.studyYear.findMany(),
    divisions: await prisma.division.findMany(),
    batches: await prisma.batch.findMany(),
    users: await prisma.user.findMany(),
    rubrics: await prisma.rubric.findMany(),
    subjects: await prisma.subject.findMany(),
    subjectFacultyBatches: await prisma.subjectFacultyBatch.findMany(),
    experiments: await prisma.experiment.findMany(),
    practicalQuestions: await prisma.practicalQuestion.findMany(),
    testCases: await prisma.testCase.findMany(),
    practicalSessions: await prisma.practicalSession.findMany(),
    sessionEntries: await prisma.sessionEntry.findMany(),
    attempts: await prisma.attempt.findMany(),
    submissions: await prisma.submission.findMany(),
    assignments: await prisma.assignment.findMany(),
    assignmentSubmissions: await prisma.assignmentSubmission.findMany(),
    resources: await prisma.resource.findMany(),
    timetableSlots: await prisma.timetableSlot.findMany(),
    notifications: await prisma.notification.findMany(),
    auditLogs: await prisma.auditLog.findMany(),
  };

  const backupPath = path.join(__dirname, '..', 'prisma', 'data-backup.json');
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2), 'utf8');

  const totalRecords = Object.values(data).reduce((acc, curr) => acc + curr.length, 0);
  console.log(`[Data Export] Successfully exported ${totalRecords} records to prisma/data-backup.json`);
}

exportAll()
  .catch((err) => {
    console.error('[Data Export Error]', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
