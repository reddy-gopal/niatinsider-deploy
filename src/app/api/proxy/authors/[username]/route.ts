import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { ApiArticle } from '@/types/articleApi';
import type { ApiAuthorProfile } from '@/lib/authorService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type AuthorProxyResponse = {
  author: ApiAuthorProfile;
  count: number;
  next: string | null;
  previous: string | null;
  articles: ApiArticle[];
};

type BadgeResponse = {
  awarded_at?: string;
};

type ArticlesResponse =
  | ApiArticle[]
  | {
      count?: number;
      next?: string | null;
      previous?: string | null;
      results?: ApiArticle[];
    };

async function readJson(response: Response): Promise<unknown> {
  return response.json().catch(() => ({}));
}

function normalizeArticles(payload: unknown): { count: number; next: string | null; previous: string | null; results: ApiArticle[] } {
  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      next: null,
      previous: null,
      results: payload as ApiArticle[],
    };
  }

  const data = (payload ?? {}) as ArticlesResponse;
  const results = Array.isArray((data as { results?: unknown }).results)
    ? ((data as { results: ApiArticle[] }).results ?? [])
    : [];

  return {
    count: typeof (data as { count?: unknown }).count === 'number' ? ((data as { count: number }).count) : results.length,
    next: typeof (data as { next?: unknown }).next === 'string' ? ((data as { next: string }).next) : null,
    previous: typeof (data as { previous?: unknown }).previous === 'string' ? ((data as { previous: string }).previous) : null,
    results,
  };
}

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
  const upstreamData = await readJson(upstream);

  if (upstream.ok) {
    return NextResponse.json(upstreamData, { status: upstream.status });
  }

  const articlesUrl = new URL(`${API_BASE.replace(/\/$/, '')}/api/articles/articles/`);
  from.searchParams.forEach((v, k) => articlesUrl.searchParams.set(k, v));
  if (!articlesUrl.searchParams.get('status')) {
    articlesUrl.searchParams.set('status', 'published');
  }
  if (!articlesUrl.searchParams.get('page_size')) {
    articlesUrl.searchParams.set('page_size', '12');
  }
  articlesUrl.searchParams.set('author_username', username);

  const articlesRes = await fetch(articlesUrl.toString(), {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!articlesRes.ok) {
    const errorPayload = (await readJson(articlesRes)) || upstreamData || { detail: 'Not found.' };
    const status = upstream.status === 500 ? 404 : upstream.status;
    return NextResponse.json(errorPayload, { status });
  }

  const articlesPayload = normalizeArticles(await readJson(articlesRes));
  if (articlesPayload.results.length === 0) {
    const status = upstream.status === 500 ? 404 : upstream.status;
    return NextResponse.json(upstreamData || { detail: 'Not found.' }, { status });
  }

  const sampleArticle = articlesPayload.results[0];
  let badge: { type: string; awarded_at: string } | null = null;
  try {
    const badgeRes = await fetch(
      `${API_BASE.replace(/\/$/, '')}/api/profiles/badge/${encodeURIComponent(username)}/`,
      { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' }
    );
    if (badgeRes.ok) {
      const badgeData = (await readJson(badgeRes)) as BadgeResponse;
      if (badgeData?.awarded_at) {
        badge = { type: 'founding_editor', awarded_at: badgeData.awarded_at };
      }
    }
  } catch {
    badge = null;
  }

  const fallbackAuthor: ApiAuthorProfile = {
    id: `fallback:${username}`,
    username,
    role: 'niat_student',
    is_verified_senior: false,
    follower_count: 0,
    is_followed_by_me: null,
    linkedin_profile: sampleArticle.author_linkedin_profile ?? '',
    campus_id: sampleArticle.campus_id ?? null,
    campus_name: sampleArticle.campus_name ?? 'Global',
    year_joined: null,
    badge: badge ?? undefined,
  };

  const response: AuthorProxyResponse = {
    author: fallbackAuthor,
    count: articlesPayload.count,
    next: articlesPayload.next,
    previous: articlesPayload.previous,
    articles: articlesPayload.results,
  };

  return NextResponse.json(response, { status: 200 });
}
