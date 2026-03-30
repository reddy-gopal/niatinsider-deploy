"use client";

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CampusLeaderboard from '@/components/CampusLeaderboard';
import { useCampuses } from '@/hooks/useCampuses';

export default function LeaderboardClient() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { campuses, isLoading } = useCampuses();

  const activeCampusSlug = searchParams.get('campus');
  const resolvedCampusSlug = useMemo(() => {
    if (activeCampusSlug && campuses.some((c) => c.slug === activeCampusSlug)) return activeCampusSlug;
    return campuses[0]?.slug ?? '';
  }, [activeCampusSlug, campuses]);

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
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#1e293b] mb-2">
            Writer Leaderboard
          </h1>
          <p className="text-[#64748b]">
            Discover top NIAT Insider contributors by campus based on article impact.
          </p>
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
              disabled={isLoading || campuses.length === 0}
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

        <CampusLeaderboard campusSlug={resolvedCampusSlug} />
      </main>

      <Footer />
    </div>
  );
}

