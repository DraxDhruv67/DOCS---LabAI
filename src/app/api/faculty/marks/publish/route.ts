import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { submissionId, rubricScores, totalScore } = await request.json();

  if (!submissionId) {
    return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 });
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      rubricScoresJson: rubricScores ? JSON.stringify(rubricScores) : undefined,
      totalScore: totalScore !== undefined ? parseFloat(totalScore) : undefined,
      status: 'PUBLISHED',
    },
  });

  // Notify student
  await prisma.notification.create({
    data: {
      userId: submission.studentId,
      title: 'Practical Marks Published',
      message: `Your practical submission marks have been published. Score: ${submission.totalScore}`,
      type: 'MARKS',
      read: false,
    },
  });

  return NextResponse.json({ submission });
}
