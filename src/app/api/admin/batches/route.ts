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
