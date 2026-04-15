import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import type { AuthorArticlesResponse, ApiAuthorProfile } from '@/lib/authorService';
import AuthorPageClient from './AuthorPageClient';

type PageProps = {
  params: Promise<{ username: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function AuthorPage({ params }: PageProps) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const headerStore = await headers();
  const proto = headerStore.get('x-forwarded-proto') ?? 'http';
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  if (!host) {
    notFound();
  }

  const authorRes = await fetch(
    `${proto}://${host}/api/proxy/authors/${encodeURIComponent(decodedUsername)}/?page_size=12`,
    { cache: 'no-store' }
  );

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
      username={decodedUsername}
      author={author}
      initialArticles={authorArticles}
      initialNext={authorPayload?.next ?? null}
    />
  );
}
