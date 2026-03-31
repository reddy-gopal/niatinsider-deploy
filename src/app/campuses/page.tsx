import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import CampusesPageClient from './CampusesPageClient';

export default async function CampusDirectoryPage() {
  const campusesRes = await fetch(`${API_BASE}/api/campuses/`, {
    next: { revalidate: 86400 },
  });
  if (!campusesRes.ok) {
    notFound();
  }

  const campusesJson = (await campusesRes.json()) as CampusListItem[] | { results?: CampusListItem[] } | null;
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson?.results ?? []);
  if (!apiCampuses.length) {
    notFound();
  }

  const campuses = apiCampuses.map(apiCampusToCampus);
  return <CampusesPageClient campuses={campuses} />;
}
