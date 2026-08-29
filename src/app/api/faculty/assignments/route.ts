import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId');
  const batchId = searchParams.get('batchId');

  const whereClause: any = {};
  if (subjectId) whereClause.subjectId = subjectId;
  if (batchId) whereClause.batchId = batchId;

  const assignments = await prisma.assignment.findMany({
    where: whereClause,
    include: {
      subject: { select: { code: true, name: true } },
      batch: { select: { name: true, division: { select: { name: true } } } },
      faculty: { select: { name: true } },
      submissions: {
        where: user.role === 'STUDENT' ? { studentId: user.id } : undefined,
      },
      _count: { select: { submissions: true } },
    },
    orderBy: { deadline: 'asc' },
  });

  return NextResponse.json({ assignments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let { subjectId, batchId, title, description, deadline, maxMarks, latePenaltyPerDay, allowedFileTypes } =
    await request.json();

  if (!subjectId || !title || !deadline) {
    return NextResponse.json({ error: 'Subject, Title, and Deadline are required' }, { status: 400 });
  }

  // Fallback to first batch if batchId was not supplied
  if (!batchId) {
    const alloc = await prisma.subjectFacultyBatch.findFirst({
      where: { subjectId, facultyId: user.id },
    });
    if (alloc) {
      batchId = alloc.batchId;
    } else {
      const anyBatch = await prisma.batch.findFirst();
      if (anyBatch) batchId = anyBatch.id;
    }
  }

  if (!batchId) {
    return NextResponse.json({ error: 'No valid batch found to attach assignment' }, { status: 400 });
  }

  const assignment = await prisma.assignment.create({
    data: {
      subjectId,
      batchId,
      facultyId: user.id,
      title: title.trim(),
      description: description ? description.trim() : '',
      deadline: new Date(deadline),
      maxMarks: maxMarks ? parseFloat(maxMarks) : 10.0,
      latePenaltyPerDay: latePenaltyPerDay ? parseFloat(latePenaltyPerDay) : 1.0,
      allowedFileTypesJson: JSON.stringify(allowedFileTypes || ['pdf', 'docx', 'png', 'zip']),
    },
  });

  return NextResponse.json({ assignment });
}
