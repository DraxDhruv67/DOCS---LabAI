import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { name, email, password, role, rollNo, employeeId, departmentId, batchId } = await request.json();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const updateData: any = {};
  if (name) updateData.name = name.trim();
  if (email) updateData.email = email.trim().toLowerCase();
  if (role) updateData.role = role.toUpperCase();
  if (rollNo !== undefined) updateData.rollNo = rollNo ? rollNo.trim() : null;
  if (employeeId !== undefined) updateData.employeeId = employeeId ? employeeId.trim() : null;
  if (departmentId !== undefined) updateData.departmentId = departmentId || null;
  if (batchId !== undefined) updateData.batchId = batchId || null;

  if (password && password.trim() !== '') {
    updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      rollNo: true,
      employeeId: true,
      departmentId: true,
      batchId: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const adminUser = await getCurrentUser();
  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ message: 'User deleted successfully' });
}
