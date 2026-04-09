import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

function rewritePaginationUrl(rawUrl: string | null | undefined, request: Request): string | null {
  if (!rawUrl) return null;
  try {
    const parsed = new URL(rawUrl);
    return `${new URL('/api/articles/articles', request.url).toString()}${parsed.search}`;
  } catch {
    return null;
  }
}

function getAuthHeader(token: string, contentType?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const upstream = await fetch(`${API_BASE}/api/articles/articles/${url.search}`, {
    method: 'GET',
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => null);
  if (!data || Array.isArray(data)) {
    return NextResponse.json(data ?? [], { status: upstream.status });
  }
  const next = rewritePaginationUrl(data.next, request);
  const previous = rewritePaginationUrl(data.previous, request);
  return NextResponse.json({ ...data, next, previous }, { status: upstream.status });
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: 'No token' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/api/articles/articles/`, {
      method: 'POST',
      headers: getAuthHeader(accessToken, 'application/json'),
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const formData = await request.formData();
  const res = await fetch(`${API_BASE}/api/articles/articles/`, {
    method: 'POST',
    headers: getAuthHeader(accessToken),
    body: formData,
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
