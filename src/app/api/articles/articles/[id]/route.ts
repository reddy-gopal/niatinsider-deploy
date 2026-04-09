import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

function getAuthHeader(token: string, contentType?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: 'No token' }, { status: 401 });
  }

  const { id } = await params;
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    const res = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/`, {
      method: 'PATCH',
      headers: getAuthHeader(accessToken, 'application/json'),
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  const formData = await request.formData();
  const res = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    headers: getAuthHeader(accessToken),
    body: formData,
    cache: 'no-store',
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
