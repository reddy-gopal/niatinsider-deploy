"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Mail, ChevronRight, Users } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import type { Article, ArticlePageArticle, Campus } from '@/types';
import type { ApiArticle } from '@/types/articleApi';
import type { ApiClub } from '@/types/clubApi';
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

type Props = {
  campusSlug: string;
  campus: Campus;
  club: ApiClub;
  initialArticles: ApiArticle[];
  initialNext: string | null;
};

export default function ClubDetailPageClient({
  campusSlug,
  campus,
  club,
  initialArticles,
  initialNext,
}: Props) {
  const [apiArticles, setApiArticles] = useState<ApiArticle[]>(initialArticles);
  const [next, setNext] = useState<string | null>(initialNext);
  const [loadingMore, setLoadingMore] = useState(false);

  const clubArticles = useMemo(
    () => apiArticles.map(apiArticleToPageArticle).sort((a, b) => b.upvoteCount - a.upvoteCount),
    [apiArticles]
  );
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

  const isChapterInactive = club.chapter_is_active === false;
  const showLeadership = Boolean(club.president_name);
  const instagramLink = (club.instagram || '').trim();
  const linkedinLinkRaw = (club.linkedin || '').trim();
  const linkedinLink = linkedinLinkRaw
    ? (linkedinLinkRaw.startsWith('http://') || linkedinLinkRaw.startsWith('https://')
      ? linkedinLinkRaw
      : `https://${linkedinLinkRaw}`)
    : '';

  const loadMore = async () => {
    if (!next || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(next);
      if (!res.ok) return;
      const data = await res.json() as { next: string | null; results: ApiArticle[] };
      setApiArticles((prev) => [...prev, ...(data.results ?? [])]);
      setNext(data.next ?? null);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <section className="relative py-8 min-h-[240px] flex flex-col justify-end">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback src={club.cover_image} alt={club.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <nav className="flex items-center text-white/70 text-sm mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px' }}>
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <Link href="/campuses" className="hover:text-white">Campuses</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <Link href={`/campus/${campusSlug ?? ''}`} className="hover:text-white">{campus.name}</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <Link href={`/campus/${campusSlug ?? ''}/clubs`} className="hover:text-white">Clubs</Link>
            <ChevronRight className="h-4 w-4 mx-2 opacity-70" />
            <span className="text-white">{club.name}</span>
          </nav>
          <h1 className="font-display text-[28px] font-bold text-white mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            {club.name}
          </h1>
          <p className="text-sm text-white/75" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
            Club Community · ~{club.member_count ?? 0} members
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isChapterInactive && (
          <div className="mb-4 p-4 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm">
            This club chapter is currently inactive at this campus.
          </div>
        )}
        <div className="bg-white rounded-[14px] p-6 border border-[rgba(30,41,59,0.1)]" style={{ boxShadow: '0 4px 12px rgba(30, 41, 59, 0.08)' }}>
          <p className="text-[#1e293b] mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.6 }}>
            {club.objective || club.about}
          </p>
          <p className="text-[#334155] mb-4" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '14px', lineHeight: 1.6 }}>
            {club.chapter_description}
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {club.contact_email ? (
              <a href={`mailto:${club.contact_email}`} className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border border-[#991b1b] text-[#991b1b] rounded-lg hover:bg-[#991b1b] hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
            ) : null}
            {instagramLink ? (
              <a href={instagramLink.startsWith('http') ? instagramLink : instagramUrl(instagramLink)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors" style={{ borderColor: '#7678ed', color: '#7678ed' }}>
                <span style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', borderRadius: '8px', padding: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faInstagram} style={{ color: 'white' }} className="w-4 h-4" />
                </span>
                Instagram
              </a>
            ) : null}
            {linkedinLink ? (
              <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm px-3 py-1.5 border rounded-lg transition-colors" style={{ borderColor: '#0a66c2', color: '#0a66c2' }}>
                <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} className="w-4 h-4" />
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>

        {showLeadership && (
          <section className="mt-8">
            <h2 className="font-display text-xl font-semibold text-[#1e293b] mb-4">Leadership</h2>
            <div className="rounded-xl border border-[rgba(30,41,59,0.1)] p-4">
              <div className="flex items-center gap-3">
                {club.president_photo ? (
                  <img src={club.president_photo} alt={club.president_name || 'President'} className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-[#f1f5f9] flex items-center justify-center"><Users className="h-5 w-5 text-[#64748b]" /></div>
                )}
                <div>
                  <p className="text-sm text-[#64748b]">President</p>
                  <p className="font-medium text-[#1e293b]">{club.president_name || '—'}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-[#1e293b] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Articles by {club.name}
          </h2>
          {cardArticles.length === 0 ? (
            <div className="rounded-xl border border-[rgba(30,41,59,0.1)] bg-[#fcfcfd] p-5">
              <p className="text-[#1e293b] font-medium mb-2">Be the first to publish for {club.name}</p>
              <Link href={`/contribute/write?campus=${encodeURIComponent(String(campus.id))}&category=club-directory&subcategory=${encodeURIComponent(club.slug)}`} className="inline-flex items-center rounded-lg bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors">
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
              <button type="button" onClick={loadMore} disabled={loadingMore} className="px-4 py-2 rounded-lg border border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3] disabled:opacity-60">
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

