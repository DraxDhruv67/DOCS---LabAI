import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subjects = await prisma.subject.findMany({
    orderBy: { name: 'asc' },
    include: {
      department: { select: { id: true, name: true, code: true } },
      studyYear: { select: { id: true, name: true } },
      rubric: true,
      facultyAllocations: {
        include: {
          faculty: { select: { id: true, name: true, email: true } },
          batch: { select: { id: true, name: true, division: { select: { name: true } } } },
        },
      },
    },
  });

  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { code, name, departmentId, studyYearId, rubricId } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Course code and name are required' }, { status: 400 });
    }

    // 1. Resolve Department
    let finalDeptId = departmentId;
    if (finalDeptId) {
      const deptExists = await prisma.department.findUnique({ where: { id: finalDeptId } });
      if (!deptExists) finalDeptId = null;
    }

    if (!finalDeptId) {
      const firstDept = await prisma.department.findFirst();
      if (firstDept) {
        finalDeptId = firstDept.id;
      } else {
        const newDept = await prisma.department.create({
          data: { code: 'CSE-DS', name: 'Computer Science & Engineering' },
        });
        finalDeptId = newDept.id;
      }
    }

    // 2. Resolve StudyYear
    let finalStudyYearId = studyYearId;
    if (finalStudyYearId) {
      const syExists = await prisma.studyYear.findUnique({ where: { id: finalStudyYearId } });
      if (!syExists) finalStudyYearId = null;
    }

    if (!finalStudyYearId) {
      const existingSy = await prisma.studyYear.findFirst({
        where: { departmentId: finalDeptId },
      });
      if (existingSy) {
        finalStudyYearId = existingSy.id;
      } else {
        let session = await prisma.academicSession.findFirst({ where: { isCurrent: true } });
        if (!session) {
          session = await prisma.academicSession.findFirst();
        }
        if (!session) {
          session = await prisma.academicSession.create({
            data: { yearRange: '2026-2027', isCurrent: true },
          });
        }

        const newSy = await prisma.studyYear.create({
          data: {
            name: 'SY',
            departmentId: finalDeptId,
            academicSessionId: session.id,
          },
        });
        finalStudyYearId = newSy.id;
      }
    }

    // 3. Create or Update Subject
    const existingSubject = await prisma.subject.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        departmentId: finalDeptId,
      },
    });

    let subject;
    if (existingSubject) {
      subject = await prisma.subject.update({
        where: { id: existingSubject.id },
        data: {
          name: name.trim(),
          studyYearId: finalStudyYearId,
          rubricId: rubricId || undefined,
        },
        include: {
          department: true,
          studyYear: true,
          rubric: true,
        },
      });
    } else {
      subject = await prisma.subject.create({
        data: {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          departmentId: finalDeptId,
          studyYearId: finalStudyYearId,
          rubricId: rubricId || null,
        },
        include: {
          department: true,
          studyYear: true,
          rubric: true,
        },
      });
    }

    return NextResponse.json({ success: true, subject });
  } catch (error: any) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create course' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
  }

  await prisma.subject.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
