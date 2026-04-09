import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { serverCookieHeader } from '@/lib/serverCookieHeader';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import ArticleDetailPageClient from './ArticleDetailPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function pickArticles(data: PaginatedResponse<ApiArticle> | ApiArticle[] | null): ApiArticle[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/article/${slug}`,
    },
    robots: preview === '1'
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function ArticlePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === '1';
  const token = isPreviewMode ? (await cookies()).get('access_token')?.value : null;
  if (isPreviewMode && !token) {
    redirect('/login');
  }

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const articleRes = await fetch(
    `${API_BASE}/api/articles/articles/${encodeURIComponent(slug)}/${isPreviewMode ? 'preview/' : ''}`,
    {
      cache: isPreviewMode ? 'no-store' : 'force-cache',
      headers: {
        ...forwardCookies,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!articleRes.ok) {
    if (isPreviewMode && articleRes.status === 401) {
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
    fetch(
      `${API_BASE}/api/articles/articles/?status=published${categoryQuery}&page_size=6`,
      { next: { revalidate: 3600 }, headers: forwardCookies }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
      headers: forwardCookies,
    }),
  ]);

  const relatedJson = relatedRes.ok
    ? (await relatedRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null
    : [];
  const latestJson = latestRes.ok
    ? (await latestRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null
    : [];

  const relatedArticles = pickArticles(relatedJson);
  const latestArticles = pickArticles(latestJson);
  const mergedRelated = mergeRelatedArticles(article.slug, relatedArticles, latestArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticleDetailPageClient
        article={article}
        previewMessage={
          isPreviewMode
            ? `⚠️ Preview Mode — This article is ${article.status} and not visible to the public.`
            : undefined
        }
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
