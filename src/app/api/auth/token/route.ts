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

/** Username + password obtain-pair (same contract as Django POST /api/token/). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const backendBaseUrl = getBackendBaseUrl();

    const djangoRes = await fetch(`${backendBaseUrl}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
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
    const refreshToken = refreshTokenFromCookies ?? null;

    if (accessToken) {
      response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

    if (refreshToken) {
      response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch {
    return NextResponse.json({ detail: 'Unable to process token request.' }, { status: 500 });
  }
}
