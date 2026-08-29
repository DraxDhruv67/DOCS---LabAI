import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('docs_token')?.value;

  // Public asset and API paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Always allow rendering the login page
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Redirect / to /login if no token
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Decode JWT role safely (payload base64 parse for middleware speed)
  let userRole: string | null = null;
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        userRole = payload.role;
      }
    } catch {
      userRole = null;
    }
  }

  // Role-based path authorization
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/faculty') && userRole !== 'FACULTY') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/student') && userRole !== 'STUDENT') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
