"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useCampuses } from '@/hooks/useCampuses';
import { getLeaderboard } from '@/lib/articlesApi';
import { Skeleton } from '@/components/ui/skeleton';
import type { LeaderboardWriter } from '@/types/articleApi';

interface CampusLeaderboardProps {
  campusSlug?: string;
  className?: string;
}

type RankStyle = {
  ring: string;
  badge: string;
  text: string;
  bg: string;
};

const RANK_STYLES: RankStyle[] = [
  {
    ring: 'ring-amber-300/70',
    badge: 'bg-amber-400 text-amber-950',
    text: 'text-amber-700',
    bg: 'from-amber-50 to-white',
  },
  {
    ring: 'ring-slate-300/80',
    badge: 'bg-slate-300 text-slate-800',
    text: 'text-slate-700',
    bg: 'from-slate-50 to-white',
  },
  {
    ring: 'ring-orange-300/70',
    badge: 'bg-orange-300 text-orange-900',
    text: 'text-orange-700',
    bg: 'from-orange-50 to-white',
  },
];

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

function LeaderboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_25px_rgba(15,23,42,0.05)]"
        >
          <Skeleton className="mb-4 h-7 w-14 rounded-full" />
          <Skeleton className="mb-3 h-6 w-2/3" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CampusLeaderboard({ campusSlug, className }: CampusLeaderboardProps) {
  const params = useParams<{ slug?: string | string[] }>();
  const routeSlug = params?.slug;
  const resolvedSlug = useMemo(() => {
    if (campusSlug) return campusSlug;
    if (Array.isArray(routeSlug)) return routeSlug[0] ?? '';
    return routeSlug ?? '';
  }, [campusSlug, routeSlug]);

  const { campuses, isLoading: isCampusesLoading } = useCampuses();
  const campusId = useMemo(() => {
    if (!resolvedSlug) return '';
    const matchedCampus = campuses.find((item) => item.slug === resolvedSlug);
    return matchedCampus?.id ?? '';
  }, [campuses, resolvedSlug]);

  const [writers, setWriters] = useState<LeaderboardWriter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setRetryToken((prev) => prev + 1);
  };

  useEffect(() => {
    let isMounted = true;

    if (!campusId) {
      if (!isCampusesLoading) {
        setIsLoading(false);
        setWriters([]);
        setIsRetrying(false);
      }
      return () => {
        isMounted = false;
      };
    }

    setIsLoading(true);
    setError(null);

    getLeaderboard(campusId)
      .then((entries) => {
        if (!isMounted) return;
        setWriters(entries.slice(0, 3));
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Unable to load leaderboard right now.');
        setWriters([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
        setIsRetrying(false);
      });

    return () => {
      isMounted = false;
    };
  }, [campusId, isCampusesLoading, retryToken]);

  const showSkeleton = isLoading || (isCampusesLoading && !campusId);

  return (
    <section className={className}>
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#991b1b]/80">Leaderboard</p>
          <h2 className="font-display text-2xl font-bold text-slate-900">Top Writers</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          Top 3
        </span>
      </div>

      {showSkeleton ? (
        <LeaderboardSkeleton />
      ) : writers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-medium text-slate-700">No leaderboard data available</p>
          {error && <p className="mt-1 text-xs text-slate-500">{error}</p>}
          {error && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="mt-4 inline-flex items-center rounded-lg border border-[#991b1b]/30 bg-[#991b1b]/5 px-4 py-2 text-sm font-medium text-[#991b1b] transition-colors hover:bg-[#991b1b]/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isRetrying && (
                <span
                  className="mr-2 inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#991b1b]/35 border-t-[#991b1b]"
                  aria-hidden
                />
              )}
              {isRetrying ? 'Retrying...' : 'Try again'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {writers.map((writer, index) => {
            const style = RANK_STYLES[index] ?? RANK_STYLES[2];
            return (
              <article
                key={`${writer.author_username}-${index}`}
                className={`group rounded-2xl border border-slate-200 bg-linear-to-br ${style.bg} p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ${style.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(15,23,42,0.12)]`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>
                    #{index + 1}
                  </span>
                  <span className={`text-xs font-semibold uppercase tracking-wide ${style.text}`}>Rank</span>
                </div>

                <h3 className="truncate text-xl font-bold text-slate-900">@{writer.author_username}</h3>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/80 p-3 transition-colors group-hover:bg-white">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total Views</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{formatCount(writer.total_views)}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-3 transition-colors group-hover:bg-white">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Articles</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{formatCount(writer.article_count)}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
