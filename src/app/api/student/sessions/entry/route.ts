import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  const session = await prisma.practicalSession.findUnique({ where: { id: sessionId } });
  if (!session) {
    return NextResponse.json({ error: 'Practical session not found' }, { status: 404 });
  }

  const entry = await prisma.sessionEntry.upsert({
    where: {
      id: `${sessionId}_${user.id}`, // synthetic fallback match or unique check
    },
    update: {},
    create: {
      sessionId,
      studentId: user.id,
    },
  });

  return NextResponse.json({ success: true, entry });
}
