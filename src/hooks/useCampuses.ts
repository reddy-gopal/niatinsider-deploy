import useSWR from 'swr';
import type { CampusListItem } from '../types/campusApi';
import { authApi } from '../lib/authApi';

const url = '/campuses/';

async function fetcher(): Promise<CampusListItem[]> {
  try {
    const res = await authApi.get<CampusListItem[] | unknown>(url, {
      headers: { Accept: 'application/json' },
      withCredentials: true,
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
