import { useCallback, useEffect, useState } from 'react';
import { clubService } from '../lib/clubService';
import type { ApiClub } from '../types/clubApi';
import type { PaginatedResponse } from '../types/articleApi';

type ListResponse = { data: PaginatedResponse<ApiClub> };
type DetailResponse = { data: ApiClub };

export function useClubs(params?: Record<string, string | number | boolean>) {
  const [clubs, setClubs] = useState<ApiClub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params ?? {});

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    clubService
      .list(params)
      .then((res: ListResponse) => {
        const data = res.data as PaginatedResponse<ApiClub>;
        setClubs(data.results ?? []);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load clubs');
        setClubs([]);
      })
      .finally(() => setLoading(false));
  }, [paramsKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { clubs, loading, error, refetch };
}

export function useClubDetail(idOrSlug: string | number | null, params?: Record<string, string | number | boolean>) {
  const [club, setClub] = useState<ApiClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paramsKey = JSON.stringify(params ?? {});

  const refetch = useCallback(() => {
    if (idOrSlug == null || idOrSlug === '') return;
    setLoading(true);
    setError(null);
    clubService
      .detail(idOrSlug, params)
      .then((res: DetailResponse) => setClub(res.data))
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load club');
        setClub(null);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug, paramsKey]);

  useEffect(() => {
    if (idOrSlug == null || idOrSlug === '') {
      setClub(null);
      setLoading(false);
      return;
    }
    refetch();
  }, [idOrSlug, refetch]);

  return { club, loading, error, refetch };
}
