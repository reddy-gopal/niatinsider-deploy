import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiClub } from '@/types/clubApi';
import ClubsPageClient from './ClubsPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default async function ClubsPage({ params }: PageProps) {
  const { slug } = await params;

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

  const clubsRes = await fetch(
    `${API_BASE}/api/articles/clubs/?campus=${encodeURIComponent(String(campusApi.id))}&is_active=true&page_size=200`,
    { next: { revalidate: 86400 } }
  );
  const clubsJson = clubsRes.ok ? await clubsRes.json() : { results: [] };
  const clubs = (Array.isArray(clubsJson) ? clubsJson : (clubsJson.results ?? [])) as ApiClub[];

  return (
    <ClubsPageClient
      campusSlug={slug}
      campus={apiCampusToCampus(campusApi)}
      clubs={clubs}
    />
  );
}
