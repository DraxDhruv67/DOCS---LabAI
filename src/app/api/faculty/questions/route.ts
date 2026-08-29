import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const experimentId = searchParams.get('experimentId');

  const whereClause: any = {};
  if (experimentId) whereClause.experimentId = experimentId;

  let questions = await prisma.practicalQuestion.findMany({
    where: whereClause,
    include: {
      testCases: true,
      experiment: { select: { experimentNo: true, title: true, subjectId: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // SECURITY FIX FOR PRIORITY 4 (HIDDEN TEST CASES):
  // Strip hidden test cases from payload if requested by STUDENT or non-faculty role
  if (user.role === 'STUDENT') {
    questions = questions.map((q) => ({
      ...q,
      testCases: q.testCases.filter((tc) => !tc.isHidden),
    }));
  }

  return NextResponse.json({ questions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { experimentId, title, description, difficulty, allowedLanguages, defaultCode, marks, testCases } =
    await request.json();

  if (!experimentId || !title || !allowedLanguages || !Array.isArray(allowedLanguages)) {
    return NextResponse.json(
      { error: 'Experiment ID, Title, and allowedLanguages array are required' },
      { status: 400 }
    );
  }

  const question = await prisma.practicalQuestion.create({
    data: {
      experimentId,
      title: title.trim(),
      description: description ? description.trim() : '',
      difficulty: (difficulty || 'MEDIUM').toUpperCase(),
      allowedLanguagesJson: JSON.stringify(allowedLanguages),
      defaultCodeJson: defaultCode ? JSON.stringify(defaultCode) : null,
      marks: marks ? parseFloat(marks) : 10.0,
    },
  });

  if (Array.isArray(testCases) && testCases.length > 0) {
    await prisma.testCase.createMany({
      data: testCases.map((tc: any) => ({
        questionId: question.id,
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || '',
        isHidden: tc.isHidden ?? false,
      })),
    });
  }

  const fullQuestion = await prisma.practicalQuestion.findUnique({
    where: { id: question.id },
    include: { testCases: true },
  });

  return NextResponse.json({ question: fullQuestion });
}
