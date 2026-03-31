import { API_BASE } from '../lib/apiBase';
import { apiCampusToCampus } from '../lib/campusUtils';
import type { CampusListItem } from '../types/campusApi';
import type { ApiArticle, PaginatedResponse } from '../types/articleApi';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const [campusesRes, latestArticlesRes, featuredArticlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 } }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, { next: { revalidate: 3600 } }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&featured=true&page_size=12`, { next: { revalidate: 3600 } }),
  ]);

  const campusesJson = campusesRes.ok
    ? await campusesRes.json() as CampusListItem[] | { results?: CampusListItem[] }
    : [];
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const campuses = apiCampuses.map(apiCampusToCampus);

  const latestJson = latestArticlesRes.ok
    ? await latestArticlesRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[]
    : [];
  const featuredJson = featuredArticlesRes.ok
    ? await featuredArticlesRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[]
    : [];

  const latestArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const featuredArticles = Array.isArray(featuredJson) ? featuredJson : (featuredJson.results ?? []);

  return (
    <HomePageClient
      campuses={campuses}
      latestArticles={latestArticles}
      featuredArticles={featuredArticles}
    />
  );
}
