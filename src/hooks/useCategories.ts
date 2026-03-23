import { useState, useEffect, useCallback } from 'react';
import { articleService } from '../lib/articleService';
import type { ApiCategory } from '../lib/articleService';

const CATEGORY_CACHE_TTL_MS = 5 * 60 * 1000;
let categoryCache:
  | {
      data: ApiCategory[];
      timestamp: number;
    }
  | null = null;
let categoryInFlight: Promise<ApiCategory[]> | null = null;

export function useCategories() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    const now = Date.now();
    if (categoryCache && now - categoryCache.timestamp < CATEGORY_CACHE_TTL_MS) {
      setCategories(categoryCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const request =
      categoryInFlight ??
      articleService.getCategories().then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        categoryCache = { data, timestamp: Date.now() };
        return data;
      });

    categoryInFlight = request;
    request
      .then((data) => {
        setCategories(data);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Failed to load categories');
        setCategories([]);
      })
      .finally(() => {
        categoryInFlight = null;
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { categories, loading, error, refetch };
}
