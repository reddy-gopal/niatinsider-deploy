import { notFound } from 'next/navigation';
import type { AuthorArticlesResponse, ApiAuthorProfile } from '@/lib/authorService';
import AuthorPageClient from '@/app/author/[authorSlug]/AuthorPageClient';

type PageProps = {
  params: Promise<{ authorSlug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function AuthorPage({ params }: PageProps) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
  const { authorSlug } = await params;
  const decoded = decodeURIComponent(authorSlug);

  let authorRes = await fetch(
    `${API_BASE}/api/authors/slug/${encodeURIComponent(decoded)}/?page_size=12`,
    { cache: 'no-store' }
  );

  if (!authorRes.ok) {
    authorRes = await fetch(
      `${API_BASE}/api/authors/${encodeURIComponent(decoded)}/`,
      { cache: 'no-store' }
    );
  }

  if (!authorRes.ok) {
    notFound();
  }

  const authorPayload = (await authorRes.json()) as AuthorArticlesResponse | null;
  const author = authorPayload?.author as ApiAuthorProfile | null;
  if (!author) {
    notFound();
  }

  const authorArticles = Array.isArray(authorPayload?.articles) ? authorPayload.articles : [];

  return (
    <AuthorPageClient
      username={author.username}
      author={author}
      initialArticles={authorArticles}
      initialNext={authorPayload?.next ?? null}
    />
  );
}
