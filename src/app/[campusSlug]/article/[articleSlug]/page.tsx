import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { serverCookieHeader } from '@/lib/serverCookieHeader';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import ArticlePageClient from './ArticlePageClient';

type PageProps = {
  params: Promise<{ campusSlug: string; articleSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { campusSlug, articleSlug } = await params;
  const { preview } = await searchParams;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/${campusSlug}/article/${articleSlug}`,
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
  const { campusSlug, articleSlug } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === '1';

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'force-cache',
    headers: forwardCookies,
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const token = isPreviewMode ? (await cookies()).get('access_token')?.value : null;
  if (isPreviewMode && !token) {
    redirect('/login');
  }

  const articleRes = await fetch(
    `${API_BASE}/api/articles/articles/${articleSlug}/${isPreviewMode ? 'preview/' : ''}`,
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
  if (!article || !article.campus_id || String(article.campus_id) !== String(campusApi.id)) {
    notFound();
  }

  const categoryQuery =
    article.category_id != null && String(article.category_id).trim() !== ''
      ? `&category_id=${encodeURIComponent(String(article.category_id))}`
      : '';

  const [primaryRes, latestRes, campusesListRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?status=published&campus=${encodeURIComponent(String(campusApi.id))}${categoryQuery}&page_size=6`,
      { next: { revalidate: 3600 }, headers: forwardCookies }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
      headers: forwardCookies,
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      headers: forwardCookies,
    }),
  ]);

  const primaryJson = primaryRes.ok ? await primaryRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const latestJson = latestRes.ok ? await latestRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const campusesJson = campusesListRes.ok ? await campusesListRes.json() as CampusListItem[] | { results?: CampusListItem[] } : [];

  const primaryRelatedArticles = Array.isArray(primaryJson) ? primaryJson : (primaryJson.results ?? []);
  const latestPublishedArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const mergedRelated = mergeRelatedArticles(article.slug, primaryRelatedArticles, latestPublishedArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticlePageClient
        campusSlug={campusSlug}
        campusName={campusApi.name}
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
          mode="campus"
          campusSlug={campusSlug}
          campusName={campusApi.name}
          apiCampuses={apiCampuses}
        />
      </div>
      <Footer />
    </div>
  );
}
