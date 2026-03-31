import { API_BASE } from '@/lib/apiBase';
import type { LeaderboardWriter } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';
import LeaderboardPageClient from './LeaderboardPageClient';

type PageProps = {
  searchParams?: Promise<{ campus?: string }>;
};

function pickCampuses(data: CampusListItem[] | { results?: CampusListItem[] } | null): CampusListItem[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

function pickWriters(data: LeaderboardWriter[] | { results?: LeaderboardWriter[] } | null): LeaderboardWriter[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const resolvedSearch = searchParams ? await searchParams : undefined;

  const [campusesRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
    }),
  ]);

  const campusesJson = campusesRes.ok
    ? (await campusesRes.json()) as CampusListItem[] | { results?: CampusListItem[] } | null
    : [];
  const campuses = pickCampuses(campusesJson);

  const requestedCampusSlug = resolvedSearch?.campus ?? '';
  const activeCampus = campuses.find((c) => c.slug === requestedCampusSlug) ?? campuses[0] ?? null;

  const [leaderboardRes] = await Promise.all([
    activeCampus
      ? fetch(
          `${API_BASE}/api/articles/articles/leaderboard/?campus_id=${encodeURIComponent(String(activeCampus.id))}`,
          { next: { revalidate: 3600 } }
        )
      : Promise.resolve(null),
  ]);

  const leaderboardJson = leaderboardRes && leaderboardRes.ok
    ? (await leaderboardRes.json()) as LeaderboardWriter[] | { results?: LeaderboardWriter[] } | null
    : [];
  const initialLeaderboard = pickWriters(leaderboardJson);

  return (
    <LeaderboardPageClient
      initialLeaderboard={initialLeaderboard}
      campuses={campuses}
      initialCampusSlug={activeCampus?.slug ?? ''}
    />
  );
}

