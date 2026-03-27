import useSWR from 'swr';
import type { CampusListItem } from '../types/campusApi';
import { API_BASE } from '../lib/apiBase';

const url = `${API_BASE}/api/campuses/`;

async function fetcher(): Promise<CampusListItem[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load campuses');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export function useCampuses() {
  const { data, error, isLoading } = useSWR<CampusListItem[]>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 60_000,
  });
  return {
    campuses: data ?? [],
    isLoading,
    isError: !!error,
  };
}
