import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  const { id } = await params;

  // Let Django return 401 for anonymous (IsAuthenticated). Do not short-circuit here — that
  // still triggered the client refresh→logout flow for guests before handleAuthFailureRedirect was fixed.
  const headers: Record<string, string> = {};
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  const upstream = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/upvote/`, {
    method: 'POST',
    headers,
    cache: 'no-store',
  });
  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
