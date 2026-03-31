import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiClub } from '@/types/clubApi';
import ClubsPageClient from './ClubsPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const campuses = (await res.json()) as CampusListItem[] | { results?: CampusListItem[] };
    const list = Array.isArray(campuses) ? campuses : (campuses.results ?? []);
    return list.map((c: { slug: string }) => ({ slug: c.slug }));
  } catch {
    return [];
  }
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
