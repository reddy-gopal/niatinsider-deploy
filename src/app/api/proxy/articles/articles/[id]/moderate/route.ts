import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const upstream = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/moderate/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${access}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
