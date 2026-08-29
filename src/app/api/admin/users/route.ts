import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  const whereClause: any = {};
  if (role) whereClause.role = role.toUpperCase();

  const users = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNo: true,
      employeeId: true,
      department: { select: { id: true, name: true, code: true } },
      batch: { select: { id: true, name: true, division: { select: { name: true } } } },
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name, email, password, role, rollNo, employeeId, departmentId, batchId } = await request.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'Name, Email, Password, and Role are required' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (existing) {
    return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: role.toUpperCase(),
      rollNo: rollNo ? rollNo.trim() : null,
      employeeId: employeeId ? employeeId.trim() : null,
      departmentId: departmentId || null,
      batchId: batchId || null,
    },
  });

  return NextResponse.json({ user: newUser });
}
