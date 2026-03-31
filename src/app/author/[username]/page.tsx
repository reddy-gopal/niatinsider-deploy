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

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
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
