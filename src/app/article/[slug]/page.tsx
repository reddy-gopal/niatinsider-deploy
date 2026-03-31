import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import ArticleDetailPageClient from './ArticleDetailPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

function pickArticles(data: PaginatedResponse<ApiArticle> | ApiArticle[] | null): ApiArticle[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function generateStaticParams() {
  const res = await fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=500`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null;
  const articles = pickArticles(json);
  return articles.filter((article) => Boolean(article.slug)).map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  const articleRes = await fetch(`${API_BASE}/api/articles/articles/${encodeURIComponent(slug)}/`, {
    cache: 'force-cache',
  });
  if (!articleRes.ok) {
    notFound();
  }
  const article = (await articleRes.json()) as ApiArticle | null;
  if (!article) {
    notFound();
  }

  const [relatedRes, latestRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?status=published&category_id=${encodeURIComponent(String(article.category_id ?? ''))}&page_size=6`,
      { next: { revalidate: 3600 } }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
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

  return (
    <ArticleDetailPageClient
      article={article}
      relatedArticles={relatedArticles}
      latestArticles={latestArticles}
    />
  );
}
