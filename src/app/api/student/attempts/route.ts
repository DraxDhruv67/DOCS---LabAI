import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { executeCode } from '@/lib/executionEngine';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const questionId = searchParams.get('questionId');
  const studentId = searchParams.get('studentId') || user.id;

  const whereClause: any = { studentId };
  if (sessionId) whereClause.sessionId = sessionId;
  if (questionId) whereClause.questionId = questionId;

  const attempts = await prisma.attempt.findMany({
    where: whereClause,
    orderBy: { attemptNumber: 'desc' },
  });

  return NextResponse.json({ attempts });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, questionId, code, language } = await request.json();

  if (!sessionId || !questionId || !code || !language) {
    return NextResponse.json({ error: 'Missing required attempt payload' }, { status: 400 });
  }

  // Fetch test cases for question
  const question = await prisma.practicalQuestion.findUnique({
    where: { id: questionId },
    include: { testCases: true },
  });

  if (!question) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  // Calculate current attempt number
  const previousAttemptCount = await prisma.attempt.count({
    where: {
      sessionId,
      studentId: user.id,
      questionId,
    },
  });

  const attemptNumber = previousAttemptCount + 1;

  // Execute code via execution engine
  const execResult = await executeCode(code, language, question.testCases);

  // Store attempt in database without overwriting previous attempts
  const attempt = await prisma.attempt.create({
    data: {
      sessionId,
      studentId: user.id,
      questionId,
      attemptNumber,
      code,
      language,
      status: execResult.status,
      executionTime: execResult.executionTime,
      memoryUsed: execResult.memoryUsed,
      testResultsJson: JSON.stringify(execResult.testResults),
      aiSuggestions: execResult.aiSuggestions,
      score: (execResult.score / 10) * question.marks,
    },
  });

  // Upsert official submission record
  const submission = await prisma.submission.upsert({
    where: {
      id: `${sessionId}_${user.id}_${questionId}`,
    },
    update: {
      finalAttemptId: attempt.id,
      totalScore: attempt.score,
    },
    create: {
      id: `${sessionId}_${user.id}_${questionId}`,
      sessionId,
      studentId: user.id,
      questionId,
      finalAttemptId: attempt.id,
      totalScore: attempt.score,
      status: 'SUBMITTED',
    },
  });

  return NextResponse.json({
    attempt,
    submission,
    executionResult: execResult,
  });
}
