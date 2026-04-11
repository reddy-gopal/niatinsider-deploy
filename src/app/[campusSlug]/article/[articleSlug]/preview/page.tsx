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
import ArticlePageClient from '../ArticlePageClient';

/** Draft / non-published preview: needs cookies + no-store — cannot be statically generated. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ campusSlug: string; articleSlug: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: false } };
}

export default async function CampusArticlePreviewPage({ params }: PageProps) {
  const { campusSlug, articleSlug } = await params;

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'no-store',
    headers: forwardCookies,
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    const from = `/${campusSlug}/article/${articleSlug}/preview`;
    redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  const articleRes = await fetch(`${API_BASE}/api/articles/articles/${articleSlug}/preview/`, {
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
      { cache: 'no-store', headers: forwardCookies }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      cache: 'no-store',
      headers: forwardCookies,
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      cache: 'no-store',
      headers: forwardCookies,
    }),
  ]);

  const primaryJson = primaryRes.ok ? ((await primaryRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[]) : [];
  const latestJson = latestRes.ok ? ((await latestRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[]) : [];
  const campusesJson = campusesListRes.ok
    ? ((await campusesListRes.json()) as CampusListItem[] | { results?: CampusListItem[] })
    : [];

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
        previewMessage={`⚠️ Preview Mode — This article is ${article.status} and not visible to the public.`}
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
