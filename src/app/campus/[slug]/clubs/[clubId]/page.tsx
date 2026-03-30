"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Mail, ChevronRight, Users } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { useCampuses } from '@/hooks/useCampuses';
import { usePublishedArticles } from '@/hooks/useArticles';
import { useClubDetail } from '@/hooks/useClubs';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { Article, ArticlePageArticle } from '@/types';
import type { ApiArticle } from '@/types/articleApi';
import { backendCategoryToFrontend } from '@/data/articleCategories';
import ArticleCard from '@/components/ArticleCard';

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

export default function ClubDetail() {
  const params = useParams();
  const campusSlug = params.slug as string;
  const clubSlug = params.clubId as string;
  const { campuses: apiCampuses } = useCampuses();
  const campus = useMemo(() => {
    if (!campusSlug || !apiCampuses.length) return null;
    const item = apiCampuses.find((c) => c.slug === campusSlug);
    return item ? apiCampusToCampus(item) : null;
  }, [apiCampuses, campusSlug]);
  const campusId = campus?.id != null ? String(campus.id) : '';
  const displayCampus = campus ?? { id: 0, slug: '', name: 'Campus', university: '', city: '—', state: '—', niatSince: new Date().getFullYear(), batchSize: 0, articleCount: 0, rating: null, coverColor: '#991b1b', coverImage: '' };
  const { club: validClub, loading: clubLoading } = useClubDetail(clubSlug || null, campusId ? { campus: campusId } : undefined);

  const { articles: apiArticles, loading: articlesLoading, next, loadMore, loadingMore } = usePublishedArticles(
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
  const cardArticles = useMemo<Article[]>(() => (
    clubArticles.map((a) => ({
      id: Number(a.id),
      slug: a.slug,
      campusId: a.campusId ?? '',
      section: a.category,
      title: a.title,
      excerpt: a.excerpt,
      author: 'NIAT Insider',
      updatedDays: a.updatedDays,
      upvoteCount: a.upvoteCount,
      coverImage: a.coverImage,
    }))
  ), [clubArticles]);

  const instagramUrl = (handle: string) => {
    const clean = handle.replace('@', '');
    return `https://instagram.com/${clean}`;
  };

  if (clubLoading) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-[#64748b]">
          Loading club...
        </div>
        <Footer />
      </div>
    );
  }

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

  const isChapterInactive = validClub.chapter_is_active === false;
  const showLeadership = Boolean(validClub.president_name);
  const instagramLink = (validClub.instagram || '').trim();
  const linkedinLinkRaw = (validClub.linkedin || '').trim();
  const linkedinLink = linkedinLinkRaw
    ? (linkedinLinkRaw.startsWith('http://') || linkedinLinkRaw.startsWith('https://')
      ? linkedinLinkRaw
      : `https://${linkedinLinkRaw}`)
    : '';

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
            Club Community · ~{validClub.member_count ?? 0} members
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isChapterInactive && (
          <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm">
            This club chapter is currently inactive at this campus.
          </div>
        )}
        <div
          className="bg-white rounded-[14px] p-6 border border-[rgba(30,41,59,0.1)]"
          style={{ boxShadow: '0 4px 12px rgba(30, 41, 59, 0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-[11px] font-semibold rounded-full border"
              style={{
                padding: '3px 10px',
                backgroundColor: '#fbf2f3',
                color: '#991b1b',
                borderColor: 'rgba(153,27,27,0.25)',
              }}
            >
              Club
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
            {validClub.objective || validClub.about}
          </p>
          <p className="text-[#334155] mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.6 }}>
            {validClub.chapter_description}
          </p>

          <div className="border-t border-[rgba(30,41,59,0.08)] my-4" />

          <p className="text-[12px] text-[rgba(30,41,59,0.5)] mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            ~{validClub.member_count ?? 0} members
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {validClub.contact_email ? (
              <a
                href={`mailto:${validClub.contact_email}`}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border border-[#991b1b] text-[#991b1b] rounded-lg hover:bg-[#991b1b] hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            ) : null}
            {instagramLink ? (
              <a
                href={instagramLink.startsWith('http') ? instagramLink : instagramUrl(instagramLink)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors"
                style={{ borderColor: '#7678ed', color: '#7678ed' }}
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
            ) : null}
            {linkedinLink ? (
              <a
                href={linkedinLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors"
                style={{ borderColor: '#0a66c2', color: '#0a66c2' }}
              >
                <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} className="w-4 h-4" />
                LinkedIn
              </a>
            ) : null}
            {!validClub.contact_email && !instagramLink && !linkedinLink && (
              <p className="text-sm italic text-[rgba(30,41,59,0.5)]">Contact via campus notice board</p>
            )}
          </div>

          <p className="text-[11px] text-[#15803d] text-right mt-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {isChapterInactive ? 'Inactive at this campus' : '✓ Active chapter'}
          </p>
        </div>

        {showLeadership && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-[#1e293b] mb-4">Leadership</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-[rgba(30,41,59,0.1)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                  {validClub.president_photo ? (
                    <img src={validClub.president_photo} alt={validClub.president_name || 'President'} className="h-12 w-12 rounded-full object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-[#f1f5f9] flex items-center justify-center"><Users className="h-5 w-5 text-[#64748b]" /></div>
                  )}
                  <div>
                    <p className="text-sm text-[#64748b]">President</p>
                    <p className="font-medium text-[#1e293b]">{validClub.president_name || '—'}</p>
                  </div>
                  </div>
                  {linkedinLink && (
                    <a
                      href={linkedinLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors"
                      style={{ borderColor: '#0a66c2', color: '#0a66c2' }}
                      aria-label="President LinkedIn profile"
                      title="LinkedIn"
                    >
                      <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
                {validClub.president_email && (
                  <a href={`mailto:${validClub.president_email}`} className="mt-3 inline-flex text-sm text-[#991b1b] hover:underline">{validClub.president_email}</a>
                )}
              </div>
            </div>
          </section>
        )}

        <Link
          href={`/campus/${campusSlug ?? ''}/clubs`}
          className="inline-block mt-6 text-[#991b1b] hover:underline"
          style={{ fontFamily: 'DM Sans, sans-serif' }}
        >
          ← Back to all {displayCampus.name} clubs
        </Link>

        <section className="mt-12">
            <h2
              className="font-display text-xl font-semibold text-[#1e293b] mb-4"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Articles by {validClub.name}
            </h2>
            {articlesLoading ? (
              <div className="py-8 text-[#64748b]">Loading articles...</div>
            ) : cardArticles.length === 0 ? (
              <div className="rounded-xl border border-[rgba(30,41,59,0.1)] bg-[#fcfcfd] p-5">
                <p className="text-[#1e293b] font-medium mb-2">Be the first to publish for {validClub.name}</p>
                <p className="text-sm text-[#64748b] mb-4">
                  Share an update, event, or achievement from this club.
                </p>
                <Link
                  href={`/contribute/write?campus=${encodeURIComponent(campusId)}&category=club-directory&subcategory=${encodeURIComponent(validClub.slug)}`}
                  className="inline-flex items-center rounded-lg bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors"
                >
                  Write an article for this club
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cardArticles.map((a) => (
                  <ArticleCard key={`${a.id}`} article={a} campusSlug={campusSlug} />
                ))}
              </div>
            )}
            {next && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-4 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3] disabled:opacity-60"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </section>
      </div>

      <Footer />
    </div>
  );
}
