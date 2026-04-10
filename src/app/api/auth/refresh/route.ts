import { NextResponse } from 'next/server';

function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
  }
  return raw.replace(/\/$/, '');
}

function readCookieValue(setCookie: string, cookieName: string): string | null {
  const match = setCookie.match(new RegExp(`${cookieName}=([^;]+)`));
  return match?.[1] ?? null;
}

function getSetCookieValues(headers: Headers): string[] {
  const withGetSetCookie = headers as Headers & { getSetCookie?: () => string[] };
  if (typeof withGetSetCookie.getSetCookie === 'function') {
    return withGetSetCookie.getSetCookie();
  }
  const combined = headers.get('set-cookie');
  if (!combined) return [];
  return combined.split(/,(?=\s*[A-Za-z0-9_\-]+=)/);
}

export async function POST(request: Request) {
  try {
    const backendBaseUrl = getBackendBaseUrl();
    const refreshToken = request.headers.get('cookie')?.match(/(?:^|;\s*)refresh_token=([^;]+)/)?.[1];

    if (!refreshToken) {
      return NextResponse.json({ detail: 'Refresh token cookie is missing.' }, { status: 400 });
    }

    const djangoRes = await fetch(`${backendBaseUrl}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `refresh_token=${refreshToken}`,
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    });

    const data = await djangoRes.json().catch(() => ({}));
    if (!djangoRes.ok) {
      return NextResponse.json(data, { status: djangoRes.status });
    }

    const response = NextResponse.json(data, { status: djangoRes.status });
    const setCookieValues = getSetCookieValues(djangoRes.headers);
    const accessTokenFromCookies = setCookieValues
      .map((cookie) => readCookieValue(cookie, 'access_token'))
      .find(Boolean);
    const refreshTokenFromCookies = setCookieValues
      .map((cookie) => readCookieValue(cookie, 'refresh_token'))
      .find(Boolean);
    const accessToken = typeof data?.access === 'string' ? data.access : (accessTokenFromCookies ?? null);
    const rotatedRefreshToken = refreshTokenFromCookies ?? null;

    // Host-only cookies — same notes as login/route.ts (www vs apex canonical host).
    if (accessToken) {
      response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

    if (rotatedRefreshToken) {
      response.cookies.set('refresh_token', rotatedRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ detail: 'Unable to refresh token.' }, { status: 500 });
  }
}
