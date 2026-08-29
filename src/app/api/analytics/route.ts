import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'summary';

  if (type === 'leaderboard') {
    // Check if leaderboard has been published by faculty for any completed session
    const publishedSession = await prisma.practicalSession.findFirst({
      where: { isLeaderboardPublished: true },
    });

    // If student and no session has published leaderboard, reject access
    if (user.role === 'STUDENT' && !publishedSession) {
      return NextResponse.json({
        leaderboard: [],
        isPublished: false,
        message: 'Leaderboard will be visible once published by faculty following practical evaluation.',
      });
    }

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        rollNo: true,
        batch: { select: { name: true, division: { select: { name: true } } } },
        submissions: {
          where: { status: 'PUBLISHED' },
          select: { totalScore: true },
        },
        attempts: {
          select: { id: true, status: true },
        },
      },
    });

    const leaderboard = students
      .map((st) => {
        const totalMarks = st.submissions.reduce((acc, curr) => acc + curr.totalScore, 0);
        const passedAttempts = st.attempts.filter((a) => a.status === 'PASSED').length;
        const totalAttempts = st.attempts.length;
        const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
        return {
          id: st.id,
          name: st.name,
          rollNo: st.rollNo || 'N/A',
          batch: st.batch ? `${st.batch.division.name} - ${st.batch.name}` : 'Unassigned',
          totalMarks,
          totalSubmissions: st.submissions.length,
          passRate,
        };
      })
      .sort((a, b) => b.totalMarks - a.totalMarks);

    return NextResponse.json({ leaderboard, isPublished: true });
  }

  if (user.role === 'STUDENT') {
    const attempts = await prisma.attempt.findMany({
      where: { studentId: user.id },
      include: { question: { select: { difficulty: true } } },
    });

    const submissions = await prisma.submission.findMany({
      where: { studentId: user.id },
      include: { question: { select: { difficulty: true } } },
    });

    const assignmentSubmissions = await prisma.assignmentSubmission.findMany({
      where: { studentId: user.id },
    });

    const easyPassed = attempts.filter((a) => a.question.difficulty === 'EASY' && a.status === 'PASSED').length;
    const mediumPassed = attempts.filter((a) => a.question.difficulty === 'MEDIUM' && a.status === 'PASSED').length;
    const hardPassed = attempts.filter((a) => a.question.difficulty === 'HARD' && a.status === 'PASSED').length;

    return NextResponse.json({
      role: 'STUDENT',
      stats: {
        totalAttempts: attempts.length,
        passedAttempts: attempts.filter((a) => a.status === 'PASSED').length,
        totalSubmissions: submissions.length,
        publishedMarksCount: submissions.filter((s) => s.status === 'PUBLISHED').length,
        assignmentSubmissionsCount: assignmentSubmissions.length,
        difficultyProgression: {
          easyPassed,
          mediumPassed,
          hardPassed,
        },
      },
    });
  }

  if (user.role === 'FACULTY') {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalSessions = await prisma.practicalSession.count({ where: { facultyId: user.id } });
    const totalSubmissions = await prisma.submission.count({
      where: { session: { facultyId: user.id } },
    });

    const allStudents = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { id: true, name: true, rollNo: true, submissions: { select: { id: true } } },
    });

    const nonSubmitters = allStudents
      .filter((s) => s.submissions.length === 0)
      .map((s) => ({ id: s.id, name: s.name, rollNo: s.rollNo }));

    return NextResponse.json({
      role: 'FACULTY',
      stats: {
        totalStudents,
        totalSessions,
        totalSubmissions,
        nonSubmittersCount: nonSubmitters.length,
        nonSubmitters,
      },
    });
  }

  // ADMIN Analytics
  const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
  const totalFaculty = await prisma.user.count({ where: { role: 'FACULTY' } });
  const totalSubjects = await prisma.subject.count();
  const totalSessions = await prisma.practicalSession.count();
  const totalSubmissions = await prisma.submission.count();

  return NextResponse.json({
    role: 'ADMIN',
    stats: {
      totalStudents,
      totalFaculty,
      totalSubjects,
      totalSessions,
      totalSubmissions,
    },
  });
}
