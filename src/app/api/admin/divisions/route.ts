import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, studyYearId } = await request.json();

  if (!name || !studyYearId) {
    return NextResponse.json({ error: 'Division name and Study Year ID are required' }, { status: 400 });
  }

  const division = await prisma.division.create({
    data: {
      name: name.trim(),
      studyYearId,
    },
  });

  return NextResponse.json({ division });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, studyYearId } = await request.json();
  if (!id || !name) return NextResponse.json({ error: 'ID and name required' }, { status: 400 });
  const dataToUpdate: any = { name: name.trim() };
  if (studyYearId) dataToUpdate.studyYearId = studyYearId;
  const division = await prisma.division.update({ where: { id }, data: dataToUpdate });
  return NextResponse.json({ division });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await prisma.division.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
