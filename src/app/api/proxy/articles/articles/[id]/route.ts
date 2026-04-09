import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const upstream = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}

export async function DELETE(_req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const upstream = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${access}` },
    cache: 'no-store',
  });
  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
