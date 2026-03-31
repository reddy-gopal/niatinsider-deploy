import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import ArticlePageClient from './ArticlePageClient';

type PageProps = {
  params: Promise<{ slug: string; articleSlug: string }>;
};

export async function generateStaticParams() {
  try {
    const campusesRes = await fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 } });
    if (!campusesRes.ok) return [];
    const campusesJson = await campusesRes.json() as CampusListItem[] | { results?: CampusListItem[] };
    const campuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);

    const nested = await Promise.all(
      campuses.map(async (campus) => {
        try {
          const articleRes = await fetch(
            `${API_BASE}/api/articles/articles/?campus=${encodeURIComponent(String(campus.id))}&status=published&page_size=200`,
            { next: { revalidate: 3600 } }
          );
          if (!articleRes.ok) return [];
          const data = await articleRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[];
          const list = Array.isArray(data) ? data : (data.results ?? []);
          return list.map((a) => ({ slug: campus.slug, articleSlug: a.slug }));
        } catch {
          return [];
        }
      })
    );
    return nested.flat();
  } catch {
    return [];
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug, articleSlug } = await params;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${slug}/`, {
    cache: 'force-cache',
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const articleRes = await fetch(`${API_BASE}/api/articles/articles/${articleSlug}/`, {
    cache: 'force-cache',
  });
  if (!articleRes.ok) {
    notFound();
  }
  const article = (await articleRes.json()) as ApiArticle | null;
  if (!article || !article.campus_id || String(article.campus_id) !== String(campusApi.id)) {
    notFound();
  }

  const [primaryRes, latestRes, campusesListRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?campus=${encodeURIComponent(String(campusApi.id))}&category_id=${encodeURIComponent(String(article.category_id ?? ''))}&page_size=6`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${API_BASE}/api/articles/articles/?page_size=12`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
    }),
  ]);

  const primaryJson = primaryRes.ok ? await primaryRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const latestJson = latestRes.ok ? await latestRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const campusesJson = campusesListRes.ok ? await campusesListRes.json() as CampusListItem[] | { results?: CampusListItem[] } : [];

  const primaryRelatedArticles = Array.isArray(primaryJson) ? primaryJson : (primaryJson.results ?? []);
  const latestPublishedArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);

  return (
    <ArticlePageClient
      campusSlug={slug}
      campusName={campusApi.name}
      article={article}
      primaryRelatedArticles={primaryRelatedArticles}
      latestPublishedArticles={latestPublishedArticles}
      apiCampuses={apiCampuses}
    />
  );
}
