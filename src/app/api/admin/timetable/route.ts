import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const facultyId = searchParams.get('facultyId');
  const batchId = searchParams.get('batchId');

  const whereClause: any = {};
  if (facultyId) whereClause.facultyId = facultyId;
  if (batchId) whereClause.batchId = batchId;

  const timetableSlots = await prisma.timetableSlot.findMany({
    where: whereClause,
    include: {
      academicSession: { select: { yearRange: true } },
      department: { select: { code: true } },
      studyYear: { select: { name: true } },
      division: { select: { name: true } },
      batch: { select: { name: true } },
      subject: { select: { code: true, name: true } },
      faculty: { select: { name: true, email: true } },
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
  });

  return NextResponse.json({ timetableSlots });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    academicSessionId,
    departmentId,
    studyYearId,
    divisionId,
    batchId,
    subjectId,
    facultyId,
    dayOfWeek,
    startTime,
    endTime,
    roomNo,
  } = await request.json();

  if (!academicSessionId || !subjectId || !batchId || !facultyId || !dayOfWeek || !startTime || !endTime) {
    return NextResponse.json({ error: 'Missing required timetable slot parameters' }, { status: 400 });
  }

  const slot = await prisma.timetableSlot.create({
    data: {
      academicSessionId,
      departmentId,
      studyYearId,
      divisionId,
      batchId,
      subjectId,
      facultyId,
      dayOfWeek: dayOfWeek.toUpperCase(),
      startTime,
      endTime,
      roomNo: roomNo || 'Lab Workspace',
    },
  });

  return NextResponse.json({ timetableSlot: slot });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Slot ID is required' }, { status: 400 });
  }

  await prisma.timetableSlot.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
