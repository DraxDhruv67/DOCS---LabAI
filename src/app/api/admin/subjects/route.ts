import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: { select: { name: true, code: true } },
      studyYear: { select: { name: true } },
      rubric: true,
      facultyAllocations: {
        include: {
          faculty: { select: { id: true, name: true, email: true } },
          batch: { select: { id: true, name: true, division: { select: { name: true } } } },
        },
      },
    },
  });

  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, name, departmentId, studyYearId, rubricId } = await request.json();

  if (!code || !name || !departmentId || !studyYearId) {
    return NextResponse.json({ error: 'Subject code, name, department, and study year are required' }, { status: 400 });
  }

  const subject = await prisma.subject.create({
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      departmentId,
      studyYearId,
      rubricId: rubricId || null,
    },
  });

  return NextResponse.json({ subject });
}
