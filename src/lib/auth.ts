import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'docs-v1-super-secret-jwt-key-2026';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  departmentId?: string | null;
  batchId?: string | null;
  rollNo?: string | null;
  employeeId?: string | null;
}

export function signJwtToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyJwtToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('docs_token')?.value;

  if (!token) return null;

  const session = verifyJwtToken(token);
  if (!session) return null;

  // Optional DB verification to ensure user exists
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      departmentId: true,
      batchId: true,
      rollNo: true,
      employeeId: true,
    },
  });

  if (!user) return null;

  return user as UserSession;
}
