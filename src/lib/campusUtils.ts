import type { Campus } from '../types';
import type { CampusListItem } from '../types/campusApi';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80';

/** Map backend GET /api/campuses/ item to frontend Campus for CampusCard. */
export function apiCampusToCampus(item: CampusListItem): Campus {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    university: item.shortName ?? item.name,
    city: item.location || '—',
    state: item.state || '—',
    description: item.description || '',
    googleMapLink: item.googleMapLink ?? null,
    niatSince: new Date().getFullYear(),
    batchSize: 0,
    articleCount: item.articleCount ?? 0,
    rating: null,
    coverColor: '#991b1b',
    coverImage: item.imageUrl || DEFAULT_COVER,
  };
}

/** Build state counts from a list of campuses (for filter tabs). */
export function stateCountsFromCampuses(campuses: Campus[]): { name: string; count: number }[] {
  const byState = new Map<string, number>();
  for (const c of campuses) {
    byState.set(c.state, (byState.get(c.state) ?? 0) + 1);
  }
  const stateEntries = Array.from(byState.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return [
    { name: 'All', count: campuses.length },
    ...stateEntries,
  ];
}
