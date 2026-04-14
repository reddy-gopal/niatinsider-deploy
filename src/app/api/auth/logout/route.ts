import { NextResponse } from 'next/server';

function getBackendBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!raw) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
  }
  return raw.replace(/\/$/, '');
}

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function POST(request: Request) {
  const response = NextResponse.json({ detail: 'logged out' });
  // Both must be cleared — leaving refresh_token would keep hasInsiderSessionCookiePair true after "logout".
  response.cookies.set('access_token', '', {
    ...cookieConfig,
    maxAge: 0,
  });
  response.cookies.set('refresh_token', '', {
    ...cookieConfig,
    maxAge: 0,
  });
  response.cookies.set('niat_needs_onboarding', '', {
    ...cookieConfig,
    maxAge: 0,
  });

  try {
    const backendBaseUrl = getBackendBaseUrl();
    const cookieHeader = request.headers.get('cookie') ?? '';
    const refreshToken = cookieHeader.match(/(?:^|;\s*)refresh_token=([^;]+)/)?.[1];
    const accessToken = cookieHeader.match(/(?:^|;\s*)access_token=([^;]+)/)?.[1];

    const upstreamCookies = [
      accessToken ? `access_token=${accessToken}` : null,
      refreshToken ? `refresh_token=${refreshToken}` : null,
    ]
      .filter(Boolean)
      .join('; ');

    await fetch(`${backendBaseUrl}/api/auth/logout/`, {
      method: 'POST',
      headers: upstreamCookies ? { Cookie: upstreamCookies } : undefined,
      body: JSON.stringify({}),
      cache: 'no-store',
    });
  } catch {
    // Best effort upstream logout; frontend cookies are already cleared.
  }

  return response;
}
