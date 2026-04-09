import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import type { ApiClub } from '@/types/clubApi';
import ClubDetailPageClient from './ClubDetailPageClient';

type PageProps = {
  params: Promise<{ campusSlug: string; clubId: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ClubDetailPage({ params }: PageProps) {
  const { campusSlug, clubId } = await params;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'force-cache',
    credentials: 'include',
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const [clubRes, articlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/articles/clubs/${encodeURIComponent(clubId)}/?campus=${encodeURIComponent(String(campusApi.id))}`, {
      next: { revalidate: 3600 },
      credentials: 'include',
    }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&campus=${encodeURIComponent(String(campusApi.id))}&category=club-directory&subcategory=${encodeURIComponent(clubId)}`, {
      next: { revalidate: 3600 },
      credentials: 'include',
    }),
  ]);

  if (!clubRes.ok) {
    notFound();
  }
  const club = (await clubRes.json()) as ApiClub | null;
  if (!club) {
    notFound();
  }

  const articlesJson = articlesRes.ok
    ? await articlesRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[]
    : { results: [], next: null };
  const initialArticles = Array.isArray(articlesJson) ? articlesJson : (articlesJson.results ?? []);
  const initialNext = Array.isArray(articlesJson) ? null : (articlesJson.next ?? null);

  return (
    <ClubDetailPageClient
      campusSlug={campusSlug}
      campus={apiCampusToCampus(campusApi)}
      club={club}
      initialArticles={initialArticles}
      initialNext={initialNext}
    />
  );
}
