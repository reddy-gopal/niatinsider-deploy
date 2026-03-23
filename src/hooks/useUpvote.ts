import useSWR from 'swr';
import { useCallback, useRef } from 'react';
import { articleService } from '../lib/articleService';
import type { UpvoteStatus } from '../types/articleApi';

const STALE_TIME_MS = 60 * 1000;
const DEBOUNCE_MS = 500;

function fetcher(articleId: string | number) {
  return articleService.getUpvoteStatus(articleId).then((r) => r.data);
}

/**
 * Upvote status with SWR (stale 60s). Toggle with optimistic update and 500ms debounce.
 */
export function useUpvote(articleId: string | number | null) {
  const { data, mutate } = useSWR<UpvoteStatus>(
    articleId != null ? ['upvote-status', articleId] : null,
    () => fetcher(articleId!),
    { revalidateOnFocus: false, revalidateOnReconnect: false, dedupingInterval: STALE_TIME_MS }
  );

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggle = useCallback(() => {
    if (articleId == null || data == null) return;

    const nextUpvoted = !data.upvoted;
    const nextCount = data.upvote_count + (nextUpvoted ? 1 : -1);
    mutate({ upvote_count: Math.max(0, nextCount), upvoted: nextUpvoted }, false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      articleService
        .toggleUpvote(articleId)
        .then((res) => mutate({ upvote_count: res.data.upvote_count, upvoted: res.data.upvoted }, false))
        .catch(() => mutate());
    }, DEBOUNCE_MS);
  }, [articleId, data, mutate]);

  return { upvoteCount: data?.upvote_count ?? 0, upvoted: data?.upvoted ?? false, toggle, isLoading: !data };
}
