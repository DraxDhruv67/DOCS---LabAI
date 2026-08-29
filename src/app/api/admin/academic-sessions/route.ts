import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await prisma.academicSession.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { studyYears: true, timetableSlots: true },
      },
    },
  });

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { yearRange, isCurrent } = await request.json();

  if (!yearRange) {
    return NextResponse.json({ error: 'Academic session range is required (e.g. 2026-2027)' }, { status: 400 });
  }

  if (isCurrent) {
    await prisma.academicSession.updateMany({
      data: { isCurrent: false },
    });
  }

  const session = await prisma.academicSession.create({
    data: {
      yearRange: yearRange.trim(),
      isCurrent: isCurrent ?? false,
    },
  });

  return NextResponse.json({ session });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, isCurrent } = await request.json();

  if (isCurrent) {
    await prisma.academicSession.updateMany({
      data: { isCurrent: false },
    });
  }

  const session = await prisma.academicSession.update({
    where: { id },
    data: { isCurrent },
  });

  return NextResponse.json({ session });
}
