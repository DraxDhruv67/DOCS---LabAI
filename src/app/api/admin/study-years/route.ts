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
