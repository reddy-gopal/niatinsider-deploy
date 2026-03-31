import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import type { AuthorArticlesResponse, ApiAuthorProfile } from '@/lib/authorService';
import type { ApiArticle } from '@/types/articleApi';
import AuthorPageClient from './AuthorPageClient';

type PageProps = {
  params: Promise<{ username: string }>;
};

type AuthorsListResponse = {
  results?: Array<{ username?: string }>;
};

export async function generateStaticParams() {
  const res = await fetch(`${API_BASE}/api/authors/?page_size=500`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as AuthorsListResponse | Array<{ username?: string }> | null;
  const authors = Array.isArray(data) ? data : (data?.results ?? []);
  return authors
    .filter((author): author is { username: string } => typeof author?.username === 'string' && author.username.length > 0)
    .map((author) => ({ username: author.username }));
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);

  const [authorRes, articlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/authors/${encodeURIComponent(decodedUsername)}/`, {
      cache: 'force-cache',
    }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&author_username=${encodeURIComponent(decodedUsername)}&page_size=12`, {
      next: { revalidate: 3600 },
    }),
  ]);

  if (!authorRes.ok) {
    notFound();
  }
  const authorPayload = (await authorRes.json()) as AuthorArticlesResponse | null;
  const author = authorPayload?.author as ApiAuthorProfile | null;
  if (!author) {
    notFound();
  }

  const authorArticlesPayload = articlesRes.ok
    ? (await articlesRes.json()) as { results?: ApiArticle[] } | ApiArticle[] | null
    : [];
  const authorArticles = Array.isArray(authorArticlesPayload)
    ? authorArticlesPayload
    : (authorArticlesPayload?.results ?? []);

  return (
    <AuthorPageClient
      username={decodedUsername}
      author={author}
      initialArticles={Array.isArray(authorPayload?.articles) ? authorPayload.articles : authorArticles}
      initialNext={authorPayload?.next ?? null}
    />
  );
}
