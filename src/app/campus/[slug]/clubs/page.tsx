"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Users, Mail, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useCampuses } from '@/hooks/useCampuses';
import { useClubs } from '@/hooks/useClubs';
import { apiCampusToCampus } from '@/lib/campusUtils';
import { CLUB_TYPE_FILTER_OPTIONS } from '@/constants/clubBadges';
import type { ClubType } from '@/types';

export default function Clubs() {
  const params = useParams();
  const campusSlug = params.slug as string;
  const { campuses: apiCampuses } = useCampuses();
  const campus = useMemo(() => {
    if (!campusSlug || !apiCampuses.length) return null;
    const item = apiCampuses.find((c) => c.slug === campusSlug);
    return item ? apiCampusToCampus(item) : null;
  }, [apiCampuses, campusSlug]);
  const campusId = campus?.id != null ? String(campus.id) : '';
  const displayCampus = campus ?? { id: 0, slug: '', name: 'Campus', university: '', city: '—', state: '—', niatSince: new Date().getFullYear(), batchSize: 0, articleCount: 0, rating: null, coverColor: '#991b1b', coverImage: '' };
  const { clubs: apiClubs, loading, error } = useClubs(campusId ? { campus: campusId, is_active: true } : undefined);

  const [typeFilter, setTypeFilter] = useState<ClubType | 'All'>('All');
  const [openToAllOnly, setOpenToAllOnly] = useState(false);

  const campusClubsCount = useMemo(
    () => apiClubs.length,
    [apiClubs]
  );

  const filteredClubs = useMemo(() => {
    let list = [...apiClubs];
    if (typeFilter !== 'All') list = list.filter((c) => c.type === typeFilter);
    if (openToAllOnly) list = list.filter((c) => c.open_to_all);
    return list;
  }, [apiClubs, typeFilter, openToAllOnly]);

  const lastUpdatedLabel = useMemo(() => {
    if (apiClubs.length === 0) return 'No updates yet';
    const latest = [...apiClubs]
      .map((c) => c.updated_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
    const days = Math.max(0, Math.floor((Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24)));
    return days === 0 ? 'Updated today' : `Updated ${days} day${days > 1 ? 's' : ''} ago`;
  }, [apiClubs]);

  const instagramUrl = (handle: string) => {
    const clean = handle.replace('@', '');
    return `https://instagram.com/${clean}`;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Page header with gradient */}
      <section
        className="py-8 min-h-[160px] flex flex-col justify-end"
        style={{
          background: `linear-gradient(135deg, ${displayCampus.coverColor} 0%, #220000 100%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav
            className="flex items-center text-white/70 text-sm mb-4"
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}
          >
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <Link href="/campuses" className="hover:text-white">Campuses</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <Link href={`/campus/${campusSlug ?? ''}`} className="hover:text-white">{displayCampus.name}</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <span className="text-white">Clubs</span>
          </nav>

          <h1
            className="font-display text-[28px] font-bold text-white mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {displayCampus.name} — Clubs & Communities
          </h1>
          <p
            className="text-sm text-white/75"
            style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}
          >
            {campusClubsCount} active clubs · {lastUpdatedLabel}
          </p>
        </div>
      </section>

      {/* Sticky filter row */}
      <div
        className="sticky top-16 z-30 border-b border-[rgba(30,41,59,0.1)] py-3 px-6"
        style={{ backgroundColor: '#fff8eb' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['All', ...CLUB_TYPE_FILTER_OPTIONS].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type as ClubType | 'All')}
                className="text-sm font-medium rounded-full px-4 py-1.5 transition-colors"
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  ...(typeFilter === type
                    ? { backgroundColor: '#991b1b', color: 'white' }
                    : { backgroundColor: '#fbf2f3', color: 'rgba(30,41,59,0.7)' }),
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'rgba(30,41,59,0.8)' }}>
            <input
              type="checkbox"
              checked={openToAllOnly}
              onChange={(e) => setOpenToAllOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            Open to All
          </label>
        </div>
      </div>

      {/* Club grid: 2 columns desktop, 1 column mobile */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
          </div>
        )}
        {!loading && error && (
          <p className="text-red-700 text-sm mb-6">{error}</p>
        )}
        {!loading && filteredClubs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="h-14 w-14 mx-auto text-[rgba(30,41,59,0.3)] mb-4" />
            <p className="text-[#1e293b] font-medium mb-1">
              No {typeFilter !== 'All' ? typeFilter.toLowerCase() : ''} clubs found at {displayCampus.name}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setTypeFilter('All');
                  setOpenToAllOnly(false);
                }}
                className="text-[#991b1b] hover:underline"
              >
                → Clear filters
              </button>
              <Link href="#" className="text-[#991b1b] hover:underline">
                → Know a club? Add it to NIAT Insider
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredClubs.map((club) => (
              <div key={club.id}>
                {/* PART 1: Club card — vertical + horizontal split */}
                <Link
                  href={`/campus/${campusSlug ?? ''}/clubs/${club.slug}`}
                  className="flex flex-col rounded-[14px] overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(30,41,59,0.14)] bg-white"
                  style={{ boxShadow: '0 4px 20px rgba(30, 41, 59, 0.10)' }}
                >
                  <div className="h-40 w-full shrink-0">
                    <ImageWithFallback src={club.cover_image} alt={club.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col md:flex-row flex-1">
                    {/* Left: maroon */}
                    <div
                      className="md:w-[30%] md:min-w-[260px] flex flex-col justify-between px-6 py-7"
                      style={{ backgroundColor: '#991b1b' }}
                    >
                      <div>
                        <span
                          className="inline-block text-[11px] font-semibold rounded-full border px-2.5 py-1 mb-3"
                          style={{
                            color: 'white',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderColor: 'white',
                          }}
                        >
                          {club.type}
                        </span>
                        <h2
                          className="font-display text-[24px] font-bold text-white mt-3"
                          style={{ fontFamily: 'Playfair Display, serif' }}
                        >
                          {club.name}
                        </h2>
                        <p
                          className="mt-2 text-[13px]"
                          style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.65)' }}
                        >
                          Est. {club.founded_year ?? '—'}
                        </p>
                      </div>
                      <div className="mt-6">
                        {club.chapter_is_active === false ? (
                          <span
                            className="inline-block text-[12px] font-medium rounded-full px-3 py-1 border"
                            style={{
                              color: '#fca5a5',
                              backgroundColor: 'rgba(127,29,29,0.3)',
                              borderColor: 'rgba(252,165,165,0.7)',
                            }}
                          >
                            Inactive Chapter
                          </span>
                        ) : club.open_to_all ? (
                          <span
                            className="inline-block text-[12px] font-medium rounded-full px-3 py-1 border"
                            style={{
                              color: 'white',
                              backgroundColor: 'rgba(255,255,255,0.15)',
                              borderColor: 'white',
                            }}
                          >
                            ✓ Open to All
                          </span>
                        ) : (
                          <span
                            className="inline-block text-[12px] font-medium rounded-full px-3 py-1 border"
                            style={{
                              color: '#fbbf24',
                              backgroundColor: 'rgba(251,191,36,0.2)',
                              borderColor: 'rgba(251,191,36,0.6)',
                            }}
                          >
                            Application Required
                          </span>
                        )}
                        <p
                          className="mt-2 text-[12px]"
                          style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.6)' }}
                        >
                          ~{club.member_count ?? 0} members
                        </p>
                      </div>
                    </div>

                    {/* Right: white content */}
                    <div className="md:w-[70%] bg-white px-8 py-7">
                      <p
                        className="text-[15px] text-[#1e293b] leading-[1.7]"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {club.chapter_description || club.about}
                      </p>

                      <div className="border-t border-[rgba(30,41,59,0.08)] my-4" />

                      <div className="mb-3">
                        <p
                          className="text-[10px] uppercase tracking-widest text-[rgba(30,41,59,0.6)] mb-1"
                          style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}
                        >
                          ACTIVITIES
                        </p>
                        <p className="text-[14px] text-[#1e293b]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {club.activities}
                        </p>
                      </div>

                      {club.achievements && (
                        <div className="mb-3">
                          <p
                            className="text-[10px] uppercase tracking-widest text-[rgba(30,41,59,0.6)] mb-1"
                            style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}
                          >
                            ACHIEVEMENT
                          </p>
                          <div
                            className="rounded-lg pl-3 py-2 pr-3 border-l-[3px] border-[#f7b801]"
                            style={{ backgroundColor: '#fffbeb' }}
                          >
                            <p className="text-[14px]" style={{ color: '#f7b801', fontFamily: 'DM Sans, sans-serif' }}>
                              🏆 {club.achievements}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <p
                          className="text-[10px] uppercase tracking-widest text-[rgba(30,41,59,0.6)] mb-1"
                          style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.08em' }}
                        >
                          HOW TO JOIN
                        </p>
                        <div
                          className="rounded-r-lg py-2.5 pl-3 pr-4 border-l-[3px] border-[#991b1b]"
                          style={{ backgroundColor: '#fbf2f3' }}
                        >
                          <p className="text-[14px] text-[#1e293b]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            {club.how_to_join}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 mt-4">
                        {club.president_name && (
                          <span className="text-[13px] text-[rgba(30,41,59,0.7)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                            Led by {club.president_name}
                          </span>
                        )}
                        {club.contact_email && (
                          <a
                            href={`mailto:${club.contact_email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-lg border border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3] transition-colors"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email Club
                          </a>
                        )}
                        {club.instagram && (
                          <a
                            href={instagramUrl(club.instagram)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-lg border border-[#7678ed] text-[#7678ed] hover:bg-[#f3f0ff] transition-colors"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            <span aria-hidden>📷</span>
                            {club.instagram}
                          </a>
                        )}
                        <span
                          className="ml-auto text-[11px] text-[#15803d]"
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {club.chapter_is_active === false ? 'Inactive at this campus' : (club.verified_at ? `✓ Verified ${club.verified_at}` : '✓ Verified')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Add Club CTA banner */}
        <div
          className="rounded-xl p-7 mt-12 border flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: '#fbf2f3',
            borderColor: 'rgba(153, 27, 27, 0.15)',
          }}
        >
          <div>
            <h3
              className="font-display text-[18px] font-bold text-[#1e293b] mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Know a club we missed?
            </h3>
            <p className="text-sm text-[rgba(30,41,59,0.6)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Help future students find their community.
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 bg-[#991b1b] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Add a Club →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
