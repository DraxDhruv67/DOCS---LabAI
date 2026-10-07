import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.batchId) {
    return NextResponse.json({ subjects: [] });
  }

  // Fetch allocations for the student's batch
  const allocations = await prisma.subjectFacultyBatch.findMany({
    where: { batchId: user.batchId },
    include: {
      subject: true,
    },
  });

  // Extract unique subjects from allocations
  const subjects = Array.from(new Map(allocations.map(a => [a.subject.id, a.subject])).values());

  return NextResponse.json({ subjects });
}
