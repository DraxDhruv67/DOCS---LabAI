import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || (user.role !== 'FACULTY' && user.role !== 'ADMIN' && user.role !== 'STUDENT')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId');

  const whereClause: any = {};
  if (subjectId) whereClause.subjectId = subjectId;

  const experiments = await prisma.experiment.findMany({
    where: whereClause,
    include: {
      subject: { select: { code: true, name: true } },
      questions: {
        include: { testCases: true },
      },
    },
    orderBy: { experimentNo: 'asc' },
  });

  return NextResponse.json({ experiments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subjectId, experimentNo, title, description, labManualUrl, questionTitle, allowedLanguages } = await request.json();

  if (!subjectId || !experimentNo || !title) {
    return NextResponse.json({ error: 'Subject ID, Experiment Number, and Title are required' }, { status: 400 });
  }

  const experiment = await prisma.experiment.create({
    data: {
      subjectId,
      experimentNo: parseInt(experimentNo, 10),
      title: title.trim(),
      description: description ? description.trim() : '',
      labManualUrl: labManualUrl || null,
    },
  });

  // Automatically create a default question so students can solve the practical immediately
  const q = await prisma.practicalQuestion.create({
    data: {
      experimentId: experiment.id,
      title: questionTitle ? questionTitle.trim() : `Implement ${title.trim()}`,
      description: description ? description.trim() : `Write a solution for ${title.trim()}.`,
      difficulty: 'MEDIUM',
      allowedLanguagesJson: JSON.stringify(allowedLanguages || ['python', 'cpp', 'c', 'java']),
      marks: 10.0,
    },
  });

  // Add default sample test case
  await prisma.testCase.create({
    data: {
      questionId: q.id,
      input: '1.0 2.0 3.0',
      expectedOutput: '1.0 2.0 3.0',
      isHidden: false,
    },
  });

  return NextResponse.json({ experiment });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, experimentNo, title, description } = await request.json();
  if (!id) return NextResponse.json({ error: 'Experiment ID is required' }, { status: 400 });

  const experiment = await prisma.experiment.update({
    where: { id },
    data: {
      ...(experimentNo !== undefined && { experimentNo: parseInt(experimentNo, 10) }),
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
    },
  });
  return NextResponse.json({ experiment });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  await prisma.experiment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
