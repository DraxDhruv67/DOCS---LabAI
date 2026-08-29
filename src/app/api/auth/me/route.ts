import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    const response = NextResponse.json({ user: null }, { status: 401 });
    response.cookies.delete('docs_token');
    return response;
  }
  return NextResponse.json({ user });
}
