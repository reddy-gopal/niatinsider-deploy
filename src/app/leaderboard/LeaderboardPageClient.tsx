"use client";

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Leaderboard from './Leaderboard';
import type { LeaderboardWriter } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';
import { useAuthStore } from '@/store/authStore';

type Props = {
  initialLeaderboard: LeaderboardWriter[];
  campuses: CampusListItem[];
  initialCampusSlug: string;
};

export default function LeaderboardPageClient({ initialLeaderboard, campuses, initialCampusSlug }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const activeCampusSlug = searchParams.get('campus');

  const resolvedCampusSlug = useMemo(() => {
    if (activeCampusSlug && campuses.some((c) => c.slug === activeCampusSlug)) return activeCampusSlug;
    return initialCampusSlug || '';
  }, [activeCampusSlug, campuses, initialCampusSlug]);

  const setCampus = (slug: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (!slug) {
      next.delete('campus');
    } else {
      next.set('campus', slug);
    }
    const qs = next.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  return (
    <div className="min-h-screen bg-[#fbf2f3] overflow-x-hidden">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <header className="mb-6 animate-[fadeSlideUp_420ms_ease-out_both]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-[#111827] mb-3">🏆 Leaderboard</h1>
              <p className="text-[#64748b] leading-relaxed">
                Explore top NIAT Insider contributors by article count across all campuses or within a selected campus.
              </p>
            </div>
            <div className="w-full sm:w-72">
              <label htmlFor="leaderboard-campus" className="block text-sm font-medium text-[#1e293b] mb-2">
                View
              </label>
              <div className="relative">
            <select
              id="leaderboard-campus"
              value={resolvedCampusSlug}
              onChange={(e) => setCampus(e.target.value)}
              suppressHydrationWarning
              className="w-full appearance-none rounded-md border border-[#f1e8e8] bg-white px-3 py-2 pr-10 text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#991b1b]/30"
            >
              <option value="">Overall Leaderboard</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
              </div>
            </div>
          </div>
        </header>
        <Leaderboard
          users={initialLeaderboard
            .filter((writer) => Boolean(writer.author_profile_slug))
            .map((writer) => ({
              author_username: writer.author_username,
              author_profile_slug: writer.author_profile_slug,
              article_count: writer.article_count,
            }))}
          currentUserId={currentUserId}
          isLoading={isPending}
          subtitle={
            resolvedCampusSlug
              ? `Campus: ${campuses.find((c) => c.slug === resolvedCampusSlug)?.name ?? "Unknown"}`
              : "Overall Leaderboard"
          }
          showHeader={false}
        />
      </main>
      <Footer />

      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
