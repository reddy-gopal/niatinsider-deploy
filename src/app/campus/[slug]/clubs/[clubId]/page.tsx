import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import type { ApiClub } from '@/types/clubApi';
import ClubDetailPageClient from './ClubDetailPageClient';

type PageProps = {
  params: Promise<{ slug: string; clubId: string }>;
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
          const clubsRes = await fetch(
            `${API_BASE}/api/articles/clubs/?campus=${encodeURIComponent(String(campus.id))}&is_active=true&page_size=200`,
            { next: { revalidate: 86400 } }
          );
          if (!clubsRes.ok) return [];
          const clubsJson = await clubsRes.json() as PaginatedResponse<ApiClub> | ApiClub[];
          const clubs = Array.isArray(clubsJson) ? clubsJson : (clubsJson.results ?? []);
          return clubs.map((club) => ({ slug: campus.slug, clubId: club.slug }));
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

export default async function ClubDetailPage({ params }: PageProps) {
  const { slug, clubId } = await params;

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

  const [clubRes, articlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/articles/clubs/${encodeURIComponent(clubId)}/?campus=${encodeURIComponent(String(campusApi.id))}`, {
      next: { revalidate: 3600 },
    }),
    fetch(`${API_BASE}/api/articles/articles/?campus=${encodeURIComponent(String(campusApi.id))}&category=club-directory&subcategory=${encodeURIComponent(clubId)}`, {
      next: { revalidate: 3600 },
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
      campusSlug={slug}
      campus={apiCampusToCampus(campusApi)}
      club={club}
      initialArticles={initialArticles}
      initialNext={initialNext}
    />
  );
}
