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
  const subjectId = searchParams.get('subjectId');

  const whereClause: any = {};
  if (facultyId) whereClause.facultyId = facultyId;
  if (batchId) whereClause.batchId = batchId;
  if (subjectId) whereClause.subjectId = subjectId;

  const now = new Date();

  let sessions = await prisma.practicalSession.findMany({
    where: whereClause,
    include: {
      subject: { select: { id: true, code: true, name: true } },
      experiment: {
        select: {
          id: true,
          experimentNo: true,
          title: true,
          description: true,
          questions: {
            include: { testCases: true },
          },
        },
      },
      batch: { select: { id: true, name: true, division: { select: { id: true, name: true } } } },
      faculty: { select: { id: true, name: true, email: true } },
      _count: { select: { sessionEntries: true, submissions: true } },
    },
    orderBy: { startTime: 'desc' },
  });

  // Dynamically update status based on current time
  sessions = await Promise.all(
    sessions.map(async (sess) => {
      let computedStatus = sess.status;
      const startMs = new Date(sess.startTime).getTime();
      const endMs = new Date(sess.endTime).getTime();
      const nowMs = now.getTime();

      if (nowMs >= startMs && nowMs <= endMs) {
        computedStatus = 'ACTIVE';
      } else if (nowMs > endMs) {
        computedStatus = 'COMPLETED';
      } else {
        computedStatus = 'SCHEDULED';
      }

      if (computedStatus !== sess.status) {
        await prisma.practicalSession.update({
          where: { id: sess.id },
          data: { status: computedStatus },
        });
        sess.status = computedStatus;
      }
      return sess;
    })
  );

  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { subjectId, experimentId, batchId, startTime, endTime } = await request.json();

  if (!subjectId || !experimentId || !batchId) {
    return NextResponse.json({ error: 'Subject, Experiment, and Batch are required' }, { status: 400 });
  }

  const now = new Date();
  const start = startTime ? new Date(startTime) : now;
  const end = endTime ? new Date(endTime) : new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  let status = 'SCHEDULED';
  if (now >= start && now <= end) status = 'ACTIVE';
  else if (now > end) status = 'COMPLETED';

  const session = await prisma.practicalSession.create({
    data: {
      subjectId,
      experimentId,
      batchId,
      facultyId: user.id,
      startTime: start,
      endTime: end,
      status,
      isLeaderboardPublished: false,
    },
  });

  return NextResponse.json({ session });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId, isLeaderboardPublished, status } = await request.json();

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  const updateData: any = {};
  if (isLeaderboardPublished !== undefined) {
    updateData.isLeaderboardPublished = Boolean(isLeaderboardPublished);
  }

  if (status === 'ACTIVE') {
    const now = new Date();
    updateData.status = 'ACTIVE';
    updateData.startTime = now;
    updateData.endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Active for 2 hours
  } else if (status === 'COMPLETED') {
    updateData.status = 'COMPLETED';
    updateData.endTime = new Date();
  }

  const session = await prisma.practicalSession.update({
    where: { id: sessionId },
    data: updateData,
  });

  return NextResponse.json({ session });
}
