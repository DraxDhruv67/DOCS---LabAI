import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, academicSessionId, departmentId } = await request.json();

  if (!name || !academicSessionId || !departmentId) {
    return NextResponse.json({ error: 'Name, Academic Session, and Department are required' }, { status: 400 });
  }

  const studyYear = await prisma.studyYear.create({
    data: {
      name: name.trim(),
      academicSessionId,
      departmentId,
    },
  });

  return NextResponse.json({ studyYear });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, academicSessionId, departmentId } = await request.json();
  if (!id || !name) return NextResponse.json({ error: 'ID and name required' }, { status: 400 });
  const dataToUpdate: any = { name: name.trim() };
  if (academicSessionId) dataToUpdate.academicSessionId = academicSessionId;
  if (departmentId) dataToUpdate.departmentId = departmentId;
  const studyYear = await prisma.studyYear.update({ where: { id }, data: dataToUpdate });
  return NextResponse.json({ studyYear });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await prisma.studyYear.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

