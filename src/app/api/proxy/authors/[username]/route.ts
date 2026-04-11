import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function GET(request: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;
  if (!username?.trim()) {
    return NextResponse.json({ detail: 'Username required.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  const access = cookieStore.get('access_token')?.value;

  const upstreamUrl = new URL(
    `${API_BASE.replace(/\/$/, '')}/api/authors/${encodeURIComponent(username)}/`
  );
  const from = new URL(request.url);
  from.searchParams.forEach((v, k) => upstreamUrl.searchParams.set(k, v));

  const headers: HeadersInit = { Accept: 'application/json' };
  if (access) {
    (headers as Record<string, string>).Authorization = `Bearer ${access}`;
  }

  const upstream = await fetch(upstreamUrl.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
