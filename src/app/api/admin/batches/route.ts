import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, divisionId } = await request.json();

  if (!name || !divisionId) {
    return NextResponse.json({ error: 'Batch name and Division ID are required' }, { status: 400 });
  }

  const batch = await prisma.batch.create({
    data: {
      name: name.trim(),
      divisionId,
    },
  });

  return NextResponse.json({ batch });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, divisionId } = await request.json();
  if (!id || !name) return NextResponse.json({ error: 'ID and name required' }, { status: 400 });
  const dataToUpdate: any = { name: name.trim() };
  if (divisionId) dataToUpdate.divisionId = divisionId;
  const batch = await prisma.batch.update({ where: { id }, data: dataToUpdate });
  return NextResponse.json({ batch });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await prisma.batch.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
