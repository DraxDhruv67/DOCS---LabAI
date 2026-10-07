import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'FACULTY') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch allocations for this faculty member
  const allocations = await prisma.subjectFacultyBatch.findMany({
    where: { facultyId: user.id },
    include: {
      subject: true,
      batch: {
        include: { division: true },
      },
    },
  });

  // Extract unique subjects and attach their allocated batches
  const subjectsMap = new Map<string, any>();
  for (const alloc of allocations) {
    if (!subjectsMap.has(alloc.subject.id)) {
      subjectsMap.set(alloc.subject.id, {
        ...alloc.subject,
        allocatedBatches: [alloc.batch],
      });
    } else {
      subjectsMap.get(alloc.subject.id).allocatedBatches.push(alloc.batch);
    }
  }

  const subjects = Array.from(subjectsMap.values());

  return NextResponse.json({ subjects });
}
