import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allocations = await prisma.subjectFacultyBatch.findMany({
    include: {
      subject: { select: { id: true, name: true, code: true } },
      batch: {
        select: {
          id: true,
          name: true,
          division: {
            select: {
              id: true,
              name: true,
              studyYear: {
                select: {
                  id: true,
                  name: true,
                  department: { select: { id: true, name: true, code: true } },
                },
              },
            },
          },
        },
      },
      faculty: { select: { id: true, name: true, email: true, employeeId: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ allocations });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subjectId, batchId, facultyId } = await request.json();

  if (!subjectId || !batchId || !facultyId) {
    return NextResponse.json({ error: 'Subject ID, Batch ID, and Faculty ID are required' }, { status: 400 });
  }

  const allocation = await prisma.subjectFacultyBatch.upsert({
    where: {
      subjectId_batchId_facultyId: { subjectId, batchId, facultyId },
    },
    update: {},
    create: {
      subjectId,
      batchId,
      facultyId,
    },
    include: {
      subject: true,
      batch: true,
      faculty: true,
    },
  });

  return NextResponse.json({ allocation });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Allocation ID is required' }, { status: 400 });
  }

  await prisma.subjectFacultyBatch.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
