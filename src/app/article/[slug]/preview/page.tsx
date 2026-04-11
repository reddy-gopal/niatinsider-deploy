import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { serverCookieHeader } from '@/lib/serverCookieHeader';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import ArticleDetailPageClient from '../ArticleDetailPageClient';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

function pickArticles(data: PaginatedResponse<ApiArticle> | ApiArticle[] | null): ApiArticle[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export default async function ArticlePreviewPage({ params }: PageProps) {
  const { slug } = await params;

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    redirect(`/login?from=${encodeURIComponent(`/article/${slug}/preview`)}`);
  }

  const articleRes = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(slug)}/preview/`, {
    cache: 'no-store',
    headers: {
      ...forwardCookies,
      Authorization: `Bearer ${token}`,
    },
  });
  if (!articleRes.ok) {
    if (articleRes.status === 401) {
      redirect('/login');
    }
    notFound();
  }
  const article = (await articleRes.json()) as ApiArticle | null;
  if (!article) {
    notFound();
  }

  const categoryQuery =
    article.category_id != null && String(article.category_id).trim() !== ''
      ? `&category_id=${encodeURIComponent(String(article.category_id))}`
      : '';

  const [relatedRes, latestRes] = await Promise.all([
    fetch(`${API_BASE}/api/articles/articles/?status=published${categoryQuery}&page_size=6`, {
      cache: 'no-store',
      headers: forwardCookies,
    }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      cache: 'no-store',
      headers: forwardCookies,
    }),
  ]);

  const relatedJson = relatedRes.ok
    ? ((await relatedRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null)
    : [];
  const latestJson = latestRes.ok
    ? ((await latestRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null)
    : [];

  const relatedArticles = pickArticles(relatedJson);
  const latestArticles = pickArticles(latestJson);
  const mergedRelated = mergeRelatedArticles(article.slug, relatedArticles, latestArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticleDetailPageClient
        article={article}
        previewMessage={`⚠️ Preview Mode — This article is ${article.status} and not visible to the public.`}
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 pb-8 sm:pb-8">
        <RelatedArticlesSection
          articles={mergedRelated}
          mode="global"
          campusSlug=""
          campusName={article.campus_name || 'Global'}
        />
      </div>
      <Footer />
    </div>
  );
}
