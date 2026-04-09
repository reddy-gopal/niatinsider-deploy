"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Users, Mail, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { ApiClub } from '@/types/clubApi';
import type { Campus } from '@/types';

type Props = {
  campusSlug: string;
  campus: Campus;
  clubs: ApiClub[];
};

export default function ClubsPageClient({ campusSlug, campus, clubs }: Props) {
  const [query, setQuery] = useState('');
  const [openToAllOnly, setOpenToAllOnly] = useState(false);
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('Recently updated');

  const campusId = String(campus.id);
  const displayCampus = campus;

  const filteredClubs = useMemo(() => {
    let list = [...clubs];
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) =>
        [c.name, c.objective, c.chapter_description, c.president_name]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    if (openToAllOnly) list = list.filter((c) => c.open_to_all);
    return list;
  }, [clubs, query, openToAllOnly]);

  useEffect(() => {
    if (clubs.length === 0) {
      setLastUpdatedLabel('No updates yet');
      return;
    }
    const latest = [...clubs]
      .map((c) => c.updated_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
    const days = Math.max(0, Math.floor((Date.now() - new Date(latest).getTime()) / (1000 * 60 * 60 * 24)));
    setLastUpdatedLabel(days === 0 ? 'Updated today' : `Updated ${days} day${days > 1 ? 's' : ''} ago`);
  }, [clubs]);

  const instagramUrl = (handle: string) => {
    const clean = handle.replace('@', '');
    return `https://instagram.com/${clean}`;
  };

  const normalizeExternalUrl = (value?: string | null) => {
    const trimmed = (value || '').trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />
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
            <Link href={`/${campusSlug ?? ''}`} className="hover:text-white">{displayCampus.name}</Link>
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
            {clubs.length} active clubs · {lastUpdatedLabel}
          </p>
        </div>
      </section>

      <div
        className="sticky top-16 z-30 border-b border-[rgba(30,41,59,0.1)] py-3 px-6"
        style={{ backgroundColor: '#fff8eb' }}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              suppressHydrationWarning
              placeholder="Search clubs, objective, lead..."
              className="min-w-[260px] rounded-lg border border-[rgba(30,41,59,0.15)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]/25"
            />
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredClubs.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Users className="h-14 w-14 mx-auto text-[rgba(30,41,59,0.3)] mb-4" />
            <p className="text-[#1e293b] font-medium mb-1">
              No clubs found at {displayCampus.name}
            </p>
            <div className="flex flex-col gap-2 mt-2">
              <button
                onClick={() => {
                  setQuery('');
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
            {filteredClubs.map((club) => {
              const chapter = (club.campus_chapters || []).find((c) => String(c.campus_id) === campusId) || club.campus_chapters?.[0];
              const instagram = (club.instagram || chapter?.instagram || '').trim();
              const linkedin = normalizeExternalUrl(club.linkedin || chapter?.linkedin || '');

              return (
                <div key={club.id}>
                  <article
                    className="flex flex-col rounded-[14px] overflow-hidden transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(30,41,59,0.14)] bg-white"
                    style={{ boxShadow: '0 4px 20px rgba(30, 41, 59, 0.10)' }}
                  >
                    <Link href={`/${campusSlug ?? ''}/clubs/${club.slug}`} className="h-40 w-full shrink-0">
                      <ImageWithFallback src={club.cover_image} alt={club.name} loading="lazy" className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex flex-col md:flex-row flex-1">
                      <div
                        className="md:w-[32%] md:min-w-[220px] flex flex-col justify-between px-5 py-6"
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
                            Club
                          </span>
                          <Link href={`/${campusSlug ?? ''}/clubs/${club.slug}`} className="block">
                            <h2
                              className="font-display text-[22px] font-bold text-white mt-3 hover:underline"
                              style={{ fontFamily: 'Playfair Display, serif' }}
                            >
                              {club.name}
                            </h2>
                          </Link>
                          <p
                            className="mt-2 text-[13px]"
                            style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.65)' }}
                          >
                            {club.president_name ? `Led by ${club.president_name}` : 'Student-led community'}
                          </p>
                        </div>
                      </div>

                      <div className="md:w-[68%] bg-white px-6 py-6">
                        <p
                          className="text-[15px] text-[#1e293b] leading-[1.7]"
                          style={{ fontFamily: 'DM Sans, sans-serif' }}
                        >
                          {club.chapter_description || club.objective}
                        </p>

                        <div className="flex flex-wrap items-center gap-2.5 mt-4">
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
                          {instagram && (
                            <a
                              href={instagram.startsWith('http') ? instagram : instagramUrl(instagram)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-lg border border-[#7678ed] text-[#7678ed] hover:bg-[#f3f0ff] transition-colors"
                              style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                              <span
                                style={{
                                  background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                                  borderRadius: '8px',
                                  padding: '4px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <FontAwesomeIcon icon={faInstagram} style={{ color: 'white' }} className="w-4 h-4" />
                              </span>
                              Instagram
                            </a>
                          )}
                          {linkedin && (
                            <a
                              href={linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1.5 text-[13px] px-3.5 py-1.5 rounded-lg border border-[#0a66c2] text-[#0a66c2] hover:bg-[#eff6ff] transition-colors"
                              style={{ fontFamily: 'DM Sans, sans-serif' }}
                            >
                              <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} className="w-4 h-4" />
                              LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
