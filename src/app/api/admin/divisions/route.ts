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
