import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rubrics = await prisma.rubric.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { subjects: true } } },
  });

  return NextResponse.json({ rubrics });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, maxMarks, criteria } = await request.json();

  if (!title || !maxMarks || !Array.isArray(criteria)) {
    return NextResponse.json({ error: 'Title, maxMarks, and criteria array are required' }, { status: 400 });
  }

  const rubric = await prisma.rubric.create({
    data: {
      title: title.trim(),
      maxMarks: parseFloat(maxMarks),
      criteriaJson: JSON.stringify(criteria),
    },
  });

  return NextResponse.json({ rubric });
}
