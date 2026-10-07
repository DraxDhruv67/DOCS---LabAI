import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signJwtToken, UserSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const limitStatus = rateLimit(`login_${ip}`, 5, 60000); // 5 attempts per minute
    
    if (!limitStatus.success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again after a minute.' }, { status: 429 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid login credentials' }, { status: 401 });
    }

    const sessionPayload: UserSession = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'FACULTY' | 'STUDENT',
      departmentId: user.departmentId,
      batchId: user.batchId,
      rollNo: user.rollNo,
      employeeId: user.employeeId,
    };

    const token = signJwtToken(sessionPayload);

    const response = NextResponse.json({
      message: 'Login successful',
      user: sessionPayload,
    });

    response.cookies.set({
      name: 'docs_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
