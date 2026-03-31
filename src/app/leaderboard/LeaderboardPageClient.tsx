"use client";

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { LeaderboardWriter } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';

type Props = {
  initialLeaderboard: LeaderboardWriter[];
  campuses: CampusListItem[];
  initialCampusSlug: string;
};

type RankStyle = {
  ring: string;
  badge: string;
  text: string;
  bg: string;
};

const RANK_STYLES: RankStyle[] = [
  { ring: 'ring-amber-300/70', badge: 'bg-amber-400 text-amber-950', text: 'text-amber-700', bg: 'from-amber-50 to-white' },
  { ring: 'ring-slate-300/80', badge: 'bg-slate-300 text-slate-800', text: 'text-slate-700', bg: 'from-slate-50 to-white' },
  { ring: 'ring-orange-300/70', badge: 'bg-orange-300 text-orange-900', text: 'text-orange-700', bg: 'from-orange-50 to-white' },
];

function formatCount(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value);
}

export default function LeaderboardPageClient({ initialLeaderboard, campuses, initialCampusSlug }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const activeCampusSlug = searchParams.get('campus');

  const resolvedCampusSlug = useMemo(() => {
    if (activeCampusSlug && campuses.some((c) => c.slug === activeCampusSlug)) return activeCampusSlug;
    return initialCampusSlug || campuses[0]?.slug || '';
  }, [activeCampusSlug, campuses, initialCampusSlug]);

  const setCampus = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set('campus', slug);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">Writer Leaderboard</h1>
          <p className="text-[#64748b]">Discover top NIAT Insider contributors by campus based on article impact.</p>
        </header>

        <div className="mb-6">
          <label htmlFor="leaderboard-campus" className="block text-sm font-medium text-[#1e293b] mb-2">
            Select campus
          </label>
          <div className="relative max-w-sm">
            <select
              id="leaderboard-campus"
              value={resolvedCampusSlug}
              onChange={(e) => setCampus(e.target.value)}
              suppressHydrationWarning
              className="w-full appearance-none rounded-md border border-[rgba(30,41,59,0.15)] bg-white px-3 py-2 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]/30"
              disabled={campuses.length === 0}
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
          </div>
        </div>

        <section>
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#991b1b]/80">Leaderboard</p>
              <h2 className="font-display text-2xl font-bold text-slate-900">Top Writers</h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              Top 3
            </span>
          </div>

          {initialLeaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
              <p className="text-sm font-medium text-slate-700">No leaderboard data available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {initialLeaderboard.map((writer, index) => {
                const style = RANK_STYLES[index] ?? RANK_STYLES[2];
                return (
                  <article
                    key={`${writer.author_username}-${index}`}
                    className={`group rounded-2xl border border-slate-200 bg-linear-to-br ${style.bg} p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ${style.ring} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(15,23,42,0.12)]`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>#{index + 1}</span>
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
      </main>
      <Footer />
    </div>
  );
}
