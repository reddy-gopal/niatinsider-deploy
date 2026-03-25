"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useCampuses } from '@/hooks/useCampuses';
import { usePublishedArticles } from '@/hooks/useArticles';
import { useClubDetail } from '@/hooks/useClubs';
import { apiCampusToCampus } from '@/lib/campusUtils';
import { CLUB_TYPE_BADGE_STYLES } from '@/constants/clubBadges';
import type { ArticlePageArticle } from '@/types';
import type { ApiArticle } from '@/types/articleApi';
import { backendCategoryToFrontend } from '@/data/articleCategories';

function apiArticleToPageArticle(a: ApiArticle): ArticlePageArticle {
  return {
    id: a.id,
    slug: a.slug,
    campusId: a.campus_id,
    campusName: a.campus_name ?? 'Global',
    category: backendCategoryToFrontend(a.category) as ArticlePageArticle['category'],
    title: a.title,
    excerpt: a.excerpt,
    coverImage: a.cover_image || undefined,
    updatedDays: a.updated_days,
    upvoteCount: a.upvote_count,
  };
}

function articleTypeBadge(category: ArticlePageArticle['category']): { label: string; bg: string; text: string } {
  switch (category) {
    case 'experiences':
      return { label: 'By member', bg: '#fff7ed', text: '#f18701' };
    case 'campus-life':
      return { label: 'Event recap', bg: '#f3f0ff', text: '#7678ed' };
    case 'howto':
      return { label: 'Guide', bg: '#f0f9ff', text: '#0369a1' };
    default:
      return { label: 'Article', bg: '#f1f5f9', text: '#64748b' };
  }
}

function categoryLabel(category: ArticlePageArticle['category']): string {
  const labels: Record<ArticlePageArticle['category'], string> = {
    'campus-life': 'Campus Life',
    experiences: 'Experiences',
    academics: 'Academics',
    howto: 'How-To',
  };
  return labels[category] ?? category;
}

export default function ClubDetail() {
  const params = useParams();
  const campusSlug = params.slug as string;
  const clubIdParam = params.clubId as string;
  const clubId = clubIdParam ? parseInt(clubIdParam, 10) : NaN;
  const { campuses: apiCampuses } = useCampuses();
  const campus = useMemo(() => {
    if (!campusSlug || !apiCampuses.length) return null;
    const item = apiCampuses.find((c) => c.slug === campusSlug);
    return item ? apiCampusToCampus(item) : null;
  }, [apiCampuses, campusSlug]);
  const campusId = campus?.id != null ? String(campus.id) : '';
  const displayCampus = campus ?? { id: 0, slug: '', name: 'Campus', university: '', city: '—', state: '—', niatSince: new Date().getFullYear(), batchSize: 0, articleCount: 0, rating: null, coverColor: '#991b1b', coverImage: '' };
  const { club } = useClubDetail(Number.isFinite(clubId) ? clubId : null);
  const validClub = club && String(club.campus_id) === campusId ? club : null;

  const { articles: apiArticles } = usePublishedArticles(
    campusId && validClub
      ? { campus: campusId, category: 'club-directory', subcategory: validClub.slug }
      : undefined,
    { enabled: Boolean(campusId && validClub) }
  );
  const clubArticles = useMemo(() => {
    if (!validClub) return [];
    return (apiArticles as ApiArticle[])
      .map(apiArticleToPageArticle)
      .sort((a, b) => b.upvoteCount - a.upvoteCount);
  }, [apiArticles, validClub]);

  const instagramUrl = (handle: string) => {
    const clean = handle.replace('@', '');
    return `https://instagram.com/${clean}`;
  };

  if (!validClub) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-[#1e293b] mb-4">Club not found.</p>
          <Link href={`/campus/${campusSlug ?? ''}/clubs`} className="text-[#991b1b] hover:underline">
            ← Back to {displayCampus.name} clubs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const badge = CLUB_TYPE_BADGE_STYLES[validClub.type];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      {/* Page header with image */}
      <section className="relative py-8 min-h-[240px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={validClub.cover_image}
            alt={validClub.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
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
            <Link href={`/campus/${campusSlug ?? ''}/clubs`} className="hover:text-white">Clubs</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <span className="text-white">{validClub.name}</span>
          </nav>

          <h1
            className="font-display text-[28px] font-bold text-white mb-1"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {validClub.name}
          </h1>
          <p className="text-sm text-white/75" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
            {validClub.type} · Est. {validClub.founded_year ?? '—'} · ~{validClub.member_count} members
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="bg-white rounded-[14px] p-6 border border-[rgba(30,41,59,0.1)]"
          style={{ boxShadow: '0 4px 12px rgba(30, 41, 59, 0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[11px] font-semibold rounded-full border"
              style={{
                padding: '3px 10px',
                backgroundColor: badge.bg,
                color: badge.text,
                borderColor: badge.border,
              }}
            >
              {validClub.type}
            </span>
            {validClub.open_to_all ? (
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                Open to All
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Application Required
              </span>
            )}
          </div>

          <p className="text-[#1e293b] mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.6 }}>
            {validClub.about}
          </p>

          <div className="border-t border-[rgba(30,41,59,0.08)] my-4" />

          <div className="mb-2">
            <p className="text-[11px] uppercase tracking-wider text-[rgba(30,41,59,0.6)] mb-0.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Activities
            </p>
            <p className="text-[13px] text-[#1e293b]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {validClub.activities}
            </p>
          </div>

          {validClub.achievements && (
            <div className="mb-2">
              <p className="text-[11px] text-[rgba(30,41,59,0.6)] mb-0.5">🏆 Achievement</p>
              <p className="text-[13px]" style={{ color: '#f7b801', fontFamily: 'DM Sans, sans-serif' }}>
                {validClub.achievements}
              </p>
            </div>
          )}

          <div
            className="rounded-lg py-2.5 px-3 border-l-[3px] border-[#991b1b] mb-3"
            style={{ backgroundColor: '#fbf2f3' }}
          >
            <p className="text-[11px] font-medium text-[rgba(30,41,59,0.7)] mb-0.5">How to Join</p>
            <p className="text-[13px] text-[#1e293b]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {validClub.how_to_join}
            </p>
          </div>

          <p className="text-[12px] text-[rgba(30,41,59,0.5)] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Est. {validClub.founded_year ?? '—'} · ~{validClub.member_count} members
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {validClub.email ? (
              <a
                href={`mailto:${validClub.email}`}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border border-[#991b1b] text-[#991b1b] rounded-lg hover:bg-[#991b1b] hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            ) : null}
            {validClub.instagram ? (
              <a
                href={instagramUrl(validClub.instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors"
                style={{ borderColor: '#7678ed', color: '#7678ed' }}
              >
                📷 Instagram
              </a>
            ) : null}
            {!validClub.email && !validClub.instagram && (
              <p className="text-sm italic text-[rgba(30,41,59,0.5)]">Contact via campus notice board</p>
            )}
          </div>

          <p className="text-[11px] text-[#15803d] text-right mt-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {validClub.verified_at ? `✓ Verified ${validClub.verified_at}` : '✓ Verified'}
          </p>
        </div>

        <Link
          href={`/campus/${campusSlug ?? ''}/clubs`}
          className="inline-block mt-6 text-[#991b1b] hover:underline"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          ← Back to all {displayCampus.name} clubs
        </Link>

        {/* Articles related to this club — section below club summary */}
        {clubArticles.length > 0 && (
          <section className="mt-12">
            <h2
              className="font-display text-xl font-semibold text-[#1e293b] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Articles related to this Club
            </h2>
            <div className="border-t border-[rgba(30,41,59,0.08)] pt-4 space-y-8">
              {clubArticles.map((article) => {
                const typeBadge = articleTypeBadge(article.category);
                return (
                  <Link
                    key={article.id}
                    href={`/campus/${campusSlug ?? ''}/article/${article.slug || article.id}`}
                    className="block p-4 rounded-xl border border-[rgba(30,41,59,0.08)] hover:bg-[#fbf2f3] hover:border-[rgba(153,27,27,0.2)] transition-colors"
                  >
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span
                        className="text-[11px] font-medium rounded-full px-2 py-0.5"
                        style={{ backgroundColor: 'rgba(30,41,59,0.08)', color: '#1e293b' }}
                      >
                        {categoryLabel(article.category)}
                      </span>
                      <span
                        className="text-[11px] font-medium rounded-full px-2 py-0.5 border border-current"
                        style={{ backgroundColor: typeBadge.bg, color: typeBadge.text }}
                      >
                        {typeBadge.label}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-bold text-[#1e293b] hover:text-[#991b1b] mb-1.5" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {article.title}
                    </h3>
                    <p
                      className="text-[13px] text-[rgba(30,41,59,0.65)] leading-relaxed mb-2"
                      style={{ fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}
                    >
                      {article.excerpt}
                    </p>
                    <p className="text-[11px] text-[rgba(30,41,59,0.5)]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      👍 {article.upvoteCount} upvotes · Updated {article.updatedDays} days ago
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
