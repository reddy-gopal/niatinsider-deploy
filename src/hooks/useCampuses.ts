import useSWR from 'swr';
import axios from 'axios';
import type { CampusListItem } from '../types/campusApi';
import { API_BASE } from '../lib/apiBase';

const url = `${API_BASE}/api/campuses/`;

async function fetcher(): Promise<CampusListItem[]> {
  try {
    const res = await axios.get<CampusListItem[] | unknown>(url, {
      headers: { Accept: 'application/json' },
    });
    const data = res.data;
    return Array.isArray(data) ? data : [];
  } catch {
    // Browser extensions can hook window.fetch and throw at runtime.
    // Axios uses XHR here, which is more resilient in this scenario.
    // Return a safe fallback so pages continue rendering.
    return [];
  }
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
