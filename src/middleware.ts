import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/session';
import { AUTH_COOKIE_NAME } from '@/lib/constants';

export default async function middleware(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin');
  const isHomePage = request.nextUrl.pathname === '/';

  // If no token and not on login page, redirect to login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token, verify it
  if (token) {
    const session = await getSession(token);

    // Invalid token - clear cookie and redirect to login
    if (!session) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // Valid token on login page - redirect based on role
    if (isLoginPage) {
      if (session.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Admin trying to access home page - redirect to admin panel
    if (isHomePage && session.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Check admin access
    if (isAdminPage && session.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Add session info to headers for server components
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.userId);
    response.headers.set('x-user-name', session.nama);
    response.headers.set('x-user-role', session.role);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.svg|.*\\.png).*)'],
};
