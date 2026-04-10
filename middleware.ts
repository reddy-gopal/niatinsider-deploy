import { NextRequest, NextResponse } from 'next/server';
import { isProtectedAppPath } from '@/lib/protectedPaths';

const AMA_ORIGIN = 'https://niat-ama.vercel.app';

function isTalkToSeniorsPath(pathname: string): boolean {
  return pathname === '/talk-to-seniors' || pathname.startsWith('/talk-to-seniors/');
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;

  // NOTE: Middleware only checks for access_token (not refresh_token).
  // If access_token is expired but refresh_token is still valid, middleware
  // treats the user as a guest here. The client-side AuthBootstrapper will
  // run ensureRefreshed() and recover the session on load.
  // Adding token refresh in middleware is possible but adds latency to every
  // edge request — defer unless it becomes a real UX problem.
  if (pathname === '/') {
    if (accessToken) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
    return NextResponse.next(); // guests see public marketing page
  }

  // Proxy /talk-to-seniors to AMA, stripping Set-Cookie so Insider HttpOnly cookies
  // (access_token, refresh_token) are never overwritten by the upstream app.
  if (isTalkToSeniorsPath(pathname)) {
    try {
      const amaUrl = new URL(pathname + request.nextUrl.search, AMA_ORIGIN);

      const amaResponse = await fetch(amaUrl.toString(), {
        method: request.method,
        headers: {
          accept: request.headers.get('accept') ?? '*/*',
          'accept-language': request.headers.get('accept-language') ?? '',
          'user-agent': request.headers.get('user-agent') ?? '',
          'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        },
      });

      const responseHeaders = new Headers();
      amaResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') {
          responseHeaders.append(key, value);
        }
      });

      return new NextResponse(amaResponse.body, {
        status: amaResponse.status,
        headers: responseHeaders,
      });
    } catch {
      return new NextResponse('Bad gateway', { status: 502 });
    }
  }

  if (isProtectedAppPath(pathname)) {
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/talk-to-seniors',
    '/talk-to-seniors/:path*',
    '/home',
    '/home/:path*',
    '/write',
    '/write/:path*',
    '/contribute',
    '/contribute/:path*',
    '/profile',
    '/profile/:path*',
    '/my-articles',
    '/my-articles/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/settings',
    '/settings/:path*',
  ],
};
