import { useState, useEffect, useCallback, useRef } from 'react';
import { articleService } from '../lib/articleService';
import type { ApiArticle } from '../types/articleApi';
import type { PaginatedResponse } from '../types/articleApi';

type ListResponse = { data: PaginatedResponse<ApiArticle> };
type DetailResponse = { data: ApiArticle };
type UsePublishedOptions = { enabled?: boolean };
type CachedArticleList = {
  results: ApiArticle[];
  next: string | null;
  timestamp: number;
};

const ARTICLE_LIST_CACHE_TTL_MS = 30 * 1000;
const ARTICLE_DETAIL_CACHE_TTL_MS = 60 * 1000;
const articleListCache = new Map<string, CachedArticleList>();
const articleListInFlight = new Map<string, Promise<ListResponse>>();
const articleDetailCache = new Map<string, { article: ApiArticle; timestamp: number }>();
const articleDetailInFlight = new Map<string, Promise<DetailResponse>>();

export function usePublishedArticles(
  params?: Record<string, string | number | boolean>,
  options?: UsePublishedOptions
) {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [isNetworkError, setIsNetworkError] = useState(false);
  const enabled = options?.enabled ?? true;
  const requestVersionRef = useRef(0);

  const paramsKey = JSON.stringify(params ?? {});

  const refetch = useCallback(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const currentRequestVersion = ++requestVersionRef.current;
    const now = Date.now();
    const cachedList = articleListCache.get(paramsKey);
    if (cachedList && now - cachedList.timestamp < ARTICLE_LIST_CACHE_TTL_MS) {
      setArticles(cachedList.results);
      setNext(cachedList.next);
      setLoading(false);
      setError(null);
      setIsNetworkError(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsNetworkError(false);
    const request =
      articleListInFlight.get(paramsKey) ??
      articleService.list(params);
    articleListInFlight.set(paramsKey, request);

    request
      .then((res: ListResponse) => {
        if (currentRequestVersion !== requestVersionRef.current) return;
        const data = res.data as PaginatedResponse<ApiArticle>;
        setArticles(data.results ?? []);
        setNext(data.next ?? null);
        articleListCache.set(paramsKey, {
          results: data.results ?? [],
          next: data.next ?? null,
          timestamp: Date.now(),
        });
      })
      .catch((e: unknown) => {
        if (currentRequestVersion !== requestVersionRef.current) return;
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        const hasResponse = err?.response != null;
        if (!hasResponse) {
          setIsNetworkError(true);
          setArticles([]);
          setNext(null);
          setError(null);
        } else {
          setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load');
          setArticles([]);
          setNext(null);
        }
      })
      .finally(() => {
        articleListInFlight.delete(paramsKey);
        if (currentRequestVersion === requestVersionRef.current) setLoading(false);
      });
  }, [enabled, paramsKey]);

  const loadMore = useCallback(() => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    articleService
      .listNextPage(next)
      .then((res: ListResponse) => {
        const data = res.data as PaginatedResponse<ApiArticle>;
        setArticles((prev: ApiArticle[]) => [...prev, ...(data.results ?? [])]);
        setNext(data.next ?? null);
      })
      .finally(() => setLoadingMore(false));
  }, [next, loadingMore]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    refetch();
  }, [enabled, refetch]);

  return { articles, loading, error, refetch, next, loadMore, loadingMore, isNetworkError };
}

export function useArticleDetail(id: string | null) {
  const [article, setArticle] = useState<ApiArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    if (id == null || id === '') return;
    const cacheKey = String(id);
    const now = Date.now();
    const cachedDetail = articleDetailCache.get(cacheKey);
    if (cachedDetail && now - cachedDetail.timestamp < ARTICLE_DETAIL_CACHE_TTL_MS) {
      setArticle(cachedDetail.article);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    const request =
      articleDetailInFlight.get(cacheKey) ??
      articleService.detail(id);
    articleDetailInFlight.set(cacheKey, request);

    request
      .then((res: DetailResponse) => {
        setArticle(res.data);
        articleDetailCache.set(cacheKey, { article: res.data, timestamp: Date.now() });
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load');
        setArticle(null);
      })
      .finally(() => {
        articleDetailInFlight.delete(cacheKey);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (id == null || id === '') {
      setArticle(null);
      setLoading(false);
      return;
    }
    refetch();
  }, [id, refetch]);

  return { article, loading, error, refetch };
}

export function usePendingArticles() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    articleService
      .pendingQueue()
      .then((res: ListResponse) => {
        const data = res.data as PaginatedResponse<ApiArticle>;
        setArticles(data.results ?? []);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load');
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { articles, loading, error, refetch };
}

export function useMyArticles() {
  const [articles, setArticles] = useState<ApiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    articleService
      .myArticles()
      .then((res: ListResponse) => {
        const data = res.data as PaginatedResponse<ApiArticle>;
        setArticles(data.results ?? []);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { detail?: string } }; message?: string };
        setError(err?.response?.data?.detail ?? err?.message ?? 'Failed to load');
        setArticles([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { articles, loading, error, refetch };
}
