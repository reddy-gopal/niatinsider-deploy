import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import CampusPageClient from './CampusPageClient';

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

export default async function CampusPage({ params }: PageProps) {
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

  const [campusesRes, articleCountRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
    }),
    fetch(`${API_BASE}/api/articles/?campus=${encodeURIComponent(String(campusApi.id))}`, {
      next: { revalidate: 3600 },
    }),
  ]);

  const campus = apiCampusToCampus(campusApi);

  const campusesJson = campusesRes.ok ? await campusesRes.json() : [];
  const apiCampuses = (Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? [])) as CampusListItem[];

  const articleCountJson = articleCountRes.ok
    ? await articleCountRes.json() as { count?: number }
    : {};
  const articleCount = articleCountJson.count ?? 0;

  return (
    <CampusPageClient
      campus={campus}
      campusSlug={slug}
      articleCount={articleCount}
      apiCampuses={apiCampuses}
    />
  );
}
