import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assignmentId, fileUrl, fileName, fileSize, textSolution } = await request.json();

  if (!assignmentId || (!fileUrl && !textSolution)) {
    return NextResponse.json({ error: 'Assignment ID and file or text solution are required' }, { status: 400 });
  }

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
  }

  const now = new Date();
  const deadline = new Date(assignment.deadline);
  let isLate = false;
  let penaltyApplied = 0.0;

  if (now > deadline) {
    isLate = true;
    const diffMs = now.getTime() - deadline.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    penaltyApplied = diffDays * assignment.latePenaltyPerDay;
  }

  const submission = await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId: user.id,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || 0,
      textSolution: textSolution || null,
      submittedAt: now,
      isLate,
      penaltyApplied,
      status: 'SUBMITTED',
    },
  });

  return NextResponse.json({ submission });
}
