import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { code: 'asc' },
    include: {
      studyYears: {
        include: {
          divisions: {
            include: { batches: true },
          },
        },
      },
      _count: { select: { users: true, subjects: true } },
    },
  });

  return NextResponse.json({ departments });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { code, name } = await request.json();

  if (!code || !name) {
    return NextResponse.json({ error: 'Department code and name are required' }, { status: 400 });
  }

  const dept = await prisma.department.create({
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
    },
  });

  return NextResponse.json({ department: dept });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, code, name } = await request.json();

  if (!id || !code || !name) {
    return NextResponse.json({ error: 'ID, code, and name are required' }, { status: 400 });
  }

  const dept = await prisma.department.update({
    where: { id },
    data: {
      code: code.trim().toUpperCase(),
      name: name.trim(),
    },
  });

  return NextResponse.json({ department: dept });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
  }

  await prisma.department.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

