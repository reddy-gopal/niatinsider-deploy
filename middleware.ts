import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isProtectedAppPath } from '@/lib/protectedPaths';

const STATIC_FILE_EXT = /\.(png|jpg|jpeg|svg|ico|js|css)$/i;

/** Skip all middleware logic (framework, APIs, static assets). */
function shouldSkipMiddleware(pathname: string): boolean {
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon.ico')) {
    return true;
  }
  if (STATIC_FILE_EXT.test(pathname)) {
    return true;
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (!isProtectedAppPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  if (accessToken) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
  ],
};
