import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import { hasInsiderSessionCookiePair } from '@/lib/sessionCookie';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import PublicHomeClient from './PublicHomeClient';

export default async function HomePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;
  if (hasInsiderSessionCookiePair(accessToken, refreshToken)) {
    redirect('/home');
  }

  const [campusesRes, latestArticlesRes, featuredArticlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 } }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&featured=true&page_size=12`, {
      next: { revalidate: 3600 },
    }),
  ]);

  const campusesJson = campusesRes.ok
    ? ((await campusesRes.json()) as CampusListItem[] | { results?: CampusListItem[] })
    : [];
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const campuses = apiCampuses.map(apiCampusToCampus);

  const latestJson = latestArticlesRes.ok
    ? ((await latestArticlesRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[])
    : [];
  const featuredJson = featuredArticlesRes.ok
    ? ((await featuredArticlesRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[])
    : [];

  const latestArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const featuredArticles = Array.isArray(featuredJson) ? featuredJson : (featuredJson.results ?? []);

  return (
    <PublicHomeClient
      campuses={campuses}
      latestArticles={latestArticles}
      featuredArticles={featuredArticles}
    />
  );
}
