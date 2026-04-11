import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const access = (await cookies()).get('access_token')?.value;
  const { id } = await params;

  // Django ArticleUpvoteStatusView is AllowAny — anonymous users must get counts without logging in.
  // Only forward Bearer when we have a token (so authenticated users still see their upvoted state).
  const headers: Record<string, string> = {};
  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  const upstream = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(id)}/upvote-status/`, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });
  const raw = await upstream.json().catch(() => ({}));
  const r = raw as { upvoted?: unknown; upvote_count?: unknown; count?: unknown };
  const payload = {
    upvoted: Boolean(r?.upvoted),
    upvote_count:
      typeof r?.upvote_count === 'number'
        ? r.upvote_count
        : typeof r?.count === 'number'
          ? r.count
          : 0,
  };
  return NextResponse.json(payload, { status: upstream.status });
}
