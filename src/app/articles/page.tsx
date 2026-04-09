import { Suspense } from 'react';
import { API_BASE } from '@/lib/apiBase';
import type { ApiCategory } from '@/lib/articleService';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';
import ArticlesPageClient from './ArticlesPageClient';

function pickArticles(data: PaginatedResponse<ApiArticle> | ApiArticle[] | null): {
  articles: ApiArticle[];
  next: string | null;
} {
  if (!data) return { articles: [], next: null };
  if (Array.isArray(data)) return { articles: data, next: null };
  return { articles: data.results ?? [], next: data.next ?? null };
}

export default async function ArticlesPage() {
  const [articlesRes, categoriesRes, campusesRes] = await Promise.all([
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
      credentials: 'include',
    }),
    fetch(`${API_BASE}/api/articles/categories/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    }),
  ]);

  const articlesJson = articlesRes.ok
    ? (await articlesRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null
    : null;
  const categories = categoriesRes.ok
    ? (await categoriesRes.json()) as ApiCategory[]
    : [];
  const campusesJson = campusesRes.ok
    ? (await campusesRes.json()) as CampusListItem[] | { results?: CampusListItem[] } | null
    : [];
  const campuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson?.results ?? []);
  const { articles, next } = pickArticles(articlesJson);

  return (
    <Suspense fallback={null}>
      <ArticlesPageClient
        initialArticles={articles}
        initialNext={next}
        categories={categories}
        campuses={campuses}
      />
    </Suspense>
  );
}
