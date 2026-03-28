"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Star, MapPin, Users, FileText, Clock, ChevronRight,
  Calendar, MessageSquare, Utensils, Home, Play, PenLine, Sparkles, ExternalLink, Info
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import RecentUpdateCard from '@/components/RecentUpdateCard';
import CampusLeaderboard from '@/components/CampusLeaderboard';
import { CampusStructuredData } from '@/components/CampusStructuredData';
import { ratings } from '@/data/mockData';
import { CLUB_TYPE_BADGE_STYLES } from '@/constants/clubBadges';
import { useCampuses } from '@/hooks/useCampuses';
import { usePublishedArticles } from '@/hooks/useArticles';
import { useClubs } from '@/hooks/useClubs';
import { apiCampusToCampus } from '@/lib/campusUtils';
import { articleService } from '@/lib/articleService';
import type { Campus } from '@/types';
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
    featured: a.featured,
    isGlobalGuide: a.is_global_guide,
    topic: (a.topic as ArticlePageArticle['topic']) ?? undefined,
  };
}

export default function Campus() {
  const params = useParams();
  const campusSlug = params.slug as string;
  const { campuses: apiCampuses, isLoading: campusesLoading } = useCampuses();
  const [articleCount, setArticleCount] = useState<number>(0);

  const campus: Campus | null = useMemo(() => {
    if (!apiCampuses.length || !campusSlug) return null;
    const item = apiCampuses.find((c) => c.slug === campusSlug);
    if (!item) return null;
    return apiCampusToCampus(item);
  }, [apiCampuses, campusSlug]);

  const campusId = campus?.id != null ? String(campus.id) : '';

  useEffect(() => {
    if (!campusId) return;
    articleService
      .list({ campus: campusId })
      .then((res) => setArticleCount((res.data as { count?: number })?.count ?? 0))
      .catch(() => setArticleCount(0));
  }, [campusId]);

  const notFound = !campusesLoading && !campus && !!campusSlug;
  const displayCampus: Campus = campus ?? {
    id: 0,
    slug: campusSlug ?? '',
    name: notFound ? 'Campus not found' : '',
    university: '',
    city: '—',
    state: '—',
    description: '',
    googleMapLink: null,
    niatSince: new Date().getFullYear(),
    batchSize: 0,
    articleCount: 0,
    rating: null,
    coverColor: '#991b1b',
    coverImage: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80',
  };
  const displayArticleCount = campus ? articleCount : displayCampus.articleCount;

  const [activeSection, setActiveSection] = useState('week1');

  const sectionRefs = {
    week1: useRef<HTMLDivElement>(null),
    campusLife: useRef<HTMLDivElement>(null),
    clubs: useRef<HTMLDivElement>(null),
    food: useRef<HTMLDivElement>(null),
    living: useRef<HTMLDivElement>(null),
    reviews: useRef<HTMLDivElement>(null),
    about: useRef<HTMLDivElement>(null),
  };

  const { articles: recentPublishedArticles, loading: recentLoading } = usePublishedArticles(
    campusId ? { campus: campusId } : undefined,
    { enabled: !!campusId }
  );
  const { clubs: campusClubs } = useClubs(campusId ? { campus: campusId } : undefined);

  const campusLifeVideos = [
    { id: '4XMwDh8BsSA', url: 'https://youtu.be/4XMwDh8BsSA?si=66y6Xlndg8C6y5yY', title: 'Hostel and First Week Vibes', tag: 'Campus Life' },
    { id: '7JObBe_knlU', url: 'https://youtu.be/7JObBe_knlU?si=azrfEDKJN5Izw4Ah', title: 'A Day in NIAT', tag: 'Student Story' },
    { id: 'LVaKm48qTMw', url: 'https://youtu.be/LVaKm48qTMw?si=aDaEbmyi6gr_IKjN', title: 'Inside Clubs and Communities', tag: 'Clubs' },
    { id: '8JhNZhq-HRU', url: 'https://youtu.be/8JhNZhq-HRU?si=eMpZcL9qWGxobV6F', title: 'Campus Tour Highlights', tag: 'Tour' },
  ];

  const campusRecentPublishedArticles = useMemo(
    () => recentPublishedArticles.filter((a) => a.campus_id != null && String(a.campus_id) === campusId),
    [recentPublishedArticles, campusId]
  );
  const slugForLinks = campus?.slug ?? campusSlug ?? '';
  const slugForCampusId = (id: string | number) => {
    const idStr = String(id);
    return idStr === campusId ? slugForLinks : (apiCampuses.find((c) => String(c.id) === idStr)?.slug ?? idStr);
  };
  const foodArticles = useMemo(
    () =>
      campusRecentPublishedArticles
        .filter((a) => a.category === 'survival-food')
        .map(apiArticleToPageArticle)
        .slice(0, 6),
    [campusRecentPublishedArticles]
  );
  const livingArticles = useMemo(
    () =>
      campusRecentPublishedArticles
        .filter((a) => a.category === 'amenities')
        .map(apiArticleToPageArticle)
        .slice(0, 6),
    [campusRecentPublishedArticles]
  );
  const thirtyDaysArticles = useMemo(
    () =>
      campusRecentPublishedArticles
        .filter((a) => a.category === 'onboarding-kit')
        .map(apiArticleToPageArticle)
        .slice(0, 6),
    [campusRecentPublishedArticles]
  );
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const ref = sectionRefs[sectionId as keyof typeof sectionRefs];
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      Object.entries(sectionRefs).forEach(([sectionId, ref]) => {
        if (ref.current) {
          const { offsetTop, offsetHeight } = ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {campus && (
        <CampusStructuredData
          name={campus.name}
          description={campus.description}
          location={campus.city}
          state={campus.state}
          slug={campus.slug}
          imageUrl={campus.coverImage}
        />
      )}
      <Navbar />

      {/* Campus Hero Header — cover and details from real API */}
      <section className="relative h-64 md:h-96 flex flex-col justify-end pb-8">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src={displayCampus.coverImage}
            alt={displayCampus.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 object-cover" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)' }} />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Breadcrumb */}
          <nav className="flex items-center text-white/70 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link href="/campuses" className="hover:text-white">Campuses</Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-white">{displayCampus.name}</span>
          </nav>

          {/* Campus Name — spinner when loading */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {campusesLoading && !campus ? (
              <span className="inline-flex items-center gap-2">
                <span className="animate-spin rounded-full border-2 border-white/30 border-t-white size-8" role="status" aria-label="Loading" />
              </span>
            ) : (
              displayCampus.name
            )}
          </h1>
          {!(campusesLoading && !campus) && (
            <p className="text-white/80 text-lg mb-4">{displayCampus.university || displayCampus.name}</p>
          )}
          {/* Stats Row — real-time article count */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {displayCampus.city}, {displayCampus.state}
            </span>
            {displayCampus.batchSize > 0 && (
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                ~{displayCampus.batchSize} students
              </span>
            )}
            <span className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              {displayArticleCount} articles
            </span>
            {displayCampus.rating != null && displayCampus.rating > 0 && (
              <span className="flex items-center">
                <Star className="h-4 w-4 text-[#f7b801] fill-[#f7b801] mr-1" />
                {displayCampus.rating}
              </span>
            )}
          </div>

          {/* Last updated badge */}
          <div className="mt-4">
            <span className="inline-flex items-center bg-white/20 text-white text-xs px-3 py-1 rounded-full">
              <Clock className="h-3 w-3 mr-1" />
              Last updated 3 days ago
            </span>
          </div>
        </div>
      </section>

      {/* Sticky Section Navigation */}
      <div className="sticky top-[6.5rem] z-40 bg-navbar border-b border-[rgba(30,41,59,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-3">
            {[
              { id: 'week1', label: '30 days', icon: Calendar },
              { id: 'campusLife', label: 'Campus Life', icon: Play },
              { id: 'clubs', label: 'Clubs', icon: Users },
              { id: 'food', label: 'Food', icon: Utensils },
              { id: 'living', label: 'Living', icon: Home },
              { id: 'reviews', label: 'Reviews', icon: MessageSquare },
              { id: 'about', label: 'About', icon: Info },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                className={`flex items-center px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${activeSection === id
                  ? 'text-[#991b1b] border-b-2 border-[#991b1b]'
                  : 'text-black hover:text-black'
                  }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CampusLeaderboard campusSlug={campusSlug} className="mb-16" />

        {/* Section: 30 days at NIAT — global articles, same on all campuses */}
        <section ref={sectionRefs.week1} className="mb-16">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              30 days at NIAT
            </h2>
          </div>
          <p className="text-black mb-6">Your first month at {displayCampus.name}: what to do week by week.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {thirtyDaysArticles.map((article) => (
              <Link
                key={article.id}
                href={article.campusId ? `/campus/${slugForCampusId(article.campusId)}/article/${article.slug}` : `/article/${article.slug}`}
                className="block bg-white rounded-lg shadow-card p-5 border-l-4 border-[#991b1b] hover:border-[#7f1d1d] transition-colors"
              >
                <h3 className="font-bold text-black mb-2">{article.title.replace('Your first month at NIAT — ', '')}</h3>
                <p className="text-sm text-black">{article.excerpt}</p>
              </Link>
            ))}
          </div>

          <Link
            href={`/articles${slugForLinks ? `?campus=${slugForLinks}` : ''}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#991b1b] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors"
          >
            Know more <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Section: Campus Life — clean, immersive moving video strip */}
        <section ref={sectionRefs.campusLife} className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#991b1b]/10">
              <Play className="h-5 w-5 text-[#991b1b]" />
            </div>
            <h2 className="font-display text-2xl font-bold text-black">
              Campus Life
            </h2>
          </div>

          <p className="text-[#64748b] text-sm mb-5 max-w-2xl">
            Real moments from NIAT. Tap any thumbnail and jump straight into campus energy.
          </p>

          {/* Infinite scrolling video strip — no CTA button, thumbnail-first */}
          <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-20 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-20 bg-gradient-to-l from-white to-transparent z-10" />
            <div className="flex w-[200%] animate-campus-life-scroll">
              {[...campusLifeVideos, ...campusLifeVideos].map((video, index) => (
                <a
                  key={`${video.id}-${index}`}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-[0_0_14.28%] shrink-0 pr-4 pl-1"
                >
                  <div className="rounded-xl overflow-hidden border border-[rgba(30,41,59,0.08)] bg-white shadow-[0_2px_8px_rgba(30,41,59,0.06)] hover:border-[#991b1b]/30 hover:shadow-[0_10px_26px_rgba(30,41,59,0.18)] transition-all duration-300">
                    <div className="relative aspect-video bg-[#1e293b]">
                      <img
                        src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-white/90 text-[#991b1b]">
                          {video.tag}
                        </span>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#991b1b]/90 text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 ml-0.5" fill="currentColor" />
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-3 right-3">
                        <p className="text-white text-sm font-medium line-clamp-1">{video.title}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Clubs */}
        <section ref={sectionRefs.clubs} className="mb-16">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              Clubs
            </h2>
          </div>
          <p className="text-black mb-6">
            Some students join clubs for fun.
            <br />
            Some join to learn something new.
          </p>

          {(() => {
            const previewClubs = campusClubs.slice(0, 3);
            if (campusClubs.length === 0) {
              return (
                <>
                  <p className="text-black mb-2">No clubs listed yet for this campus.</p>
                  <Link href={`/campus/${slugForLinks}/clubs`} className="text-[#991b1b] hover:underline">
                    → View clubs directory
                  </Link>
                </>
              );
            }
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {previewClubs.map((club) => {
                    const badge = CLUB_TYPE_BADGE_STYLES[club.type];
                    return (
                      <Link
                        key={club.id}
                        href={`/campus/${slugForLinks}/clubs/${club.id}`}
                        className="block bg-white rounded-xl border border-[rgba(30,41,59,0.1)] transition-all hover:border-[#991b1b] hover:shadow-lg overflow-hidden flex flex-col"
                        style={{ boxShadow: '0 4px 12px rgba(30, 41, 59, 0.08)' }}
                      >
                        {club.cover_image && (
                          <div className="h-32 w-full shrink-0">
                            <ImageWithFallback src={club.cover_image} alt={club.name} loading="lazy" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[11px] font-semibold rounded-full border"
                              style={{
                                padding: '3px 10px',
                                backgroundColor: badge.bg,
                                color: badge.text,
                                borderColor: badge.border,
                              }}
                            >
                              {club.type}
                            </span>
                            {club.open_to_all ? (
                              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                Open to All
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                Application Required
                              </span>
                            )}
                          </div>
                          <h3 className="font-display text-[17px] font-bold text-[#1e293b] mb-2">
                            {club.name}
                          </h3>
                          <p
                            className="text-[13px] text-[rgba(30,41,59,0.7)] mb-3 line-clamp-2"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            {club.about}
                          </p>
                          <p
                            className="text-[12px] text-[rgba(30,41,59,0.5)] mb-2"
                            style={{ fontFamily: 'DM Sans, sans-serif' }}
                          >
                            Since {club.founded_year ?? '—'} · ~{club.member_count} members
                          </p>
                          <span className="text-[#991b1b] text-sm font-medium hover:underline">
                            View details →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <Link
                  href={`/campus/${slugForLinks}/clubs`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 border-2 border-[#991b1b] text-[#991b1b] font-medium rounded-lg hover:bg-[#991b1b] hover:text-white transition-colors"
                >
                  Club directory <ChevronRight className="h-4 w-4" />
                </Link>
              </>
            );
          })()}
        </section>

        {/* Section: Food */}
        <section ref={sectionRefs.food} className="mb-16">
          <div className="flex items-center mb-4">
            <Utensils className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              Food
            </h2>
          </div>
          <p className="text-black mb-6">Where to eat at and around {displayCampus.name}</p>
          {foodArticles.length === 0 ? (
            <p className="text-black mb-4">No food articles yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {foodArticles.map((article) => (
                <Link
                  key={article.id}
                  href={article.campusId ? `/campus/${slugForCampusId(article.campusId)}/article/${article.slug}` : `/article/${article.slug}`}
                  className="block bg-white rounded-xl shadow-card overflow-hidden border border-transparent hover:border-[#991b1b]/30 transition-colors"
                >
                  {article.coverImage && (
                    <div className="h-32 w-full overflow-hidden">
                      <ImageWithFallback src={article.coverImage} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-medium text-[#1e293b] mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-[#64748b] line-clamp-2 mb-2">{article.excerpt}</p>
                    <span className="text-xs text-[#94a3b8]">👍 {article.upvoteCount} upvotes</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            href={`/articles${slugForLinks ? `?campus=${slugForLinks}` : ''}`}
            className="inline-flex items-center gap-1.5 text-[#991b1b] font-medium text-sm hover:underline"
          >
            Know more <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Section: Living */}
        <section ref={sectionRefs.living} className="mb-16">
          <div className="flex items-center mb-4">
            <Home className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              Living
            </h2>
          </div>
          <p className="text-black mb-6">Hostel, PG, and accommodation near {displayCampus.name}</p>
          {livingArticles.length === 0 ? (
            <p className="text-black mb-4">No living articles yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {livingArticles.map((article) => (
                <Link
                  key={article.id}
                  href={article.campusId ? `/campus/${slugForCampusId(article.campusId)}/article/${article.slug}` : `/article/${article.slug}`}
                  className="block bg-white rounded-xl shadow-card overflow-hidden border border-transparent hover:border-[#991b1b]/30 transition-colors"
                >
                  {article.coverImage && (
                    <div className="h-32 w-full overflow-hidden">
                      <ImageWithFallback src={article.coverImage} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-medium text-[#1e293b] mb-1 line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-[#64748b] line-clamp-2 mb-2">{article.excerpt}</p>
                    <span className="text-xs text-[#94a3b8]">👍 {article.upvoteCount} upvotes</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link
            href={`/articles${slugForLinks ? `?campus=${slugForLinks}` : ''}`}
            className="inline-flex items-center gap-1.5 text-[#991b1b] font-medium text-sm hover:underline"
          >
            Know more <ChevronRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Section: Student Ratings & Reviews */}
        <section ref={sectionRefs.reviews} className="mb-16">
          <div className="flex items-center mb-4">
            <MessageSquare className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              Student Ratings & Reviews
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <div className="flex items-center mb-6">
              <div className="text-center mr-8">
                <span className="font-display text-5xl font-bold text-[#991b1b]">
                  {displayCampus.rating ?? 'N/A'}
                </span>
                <p className="text-sm text-black">{ratings.totalReviews} reviews</p>
              </div>

              <div className="flex-1 space-y-2">
                {[
                  { label: 'Hostel', value: ratings.hostel },
                  { label: 'Infrastructure', value: ratings.infrastructure },
                  { label: 'Social Life', value: ratings.socialLife },
                  { label: 'Food', value: ratings.food },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center">
                    <span className="w-28 text-sm text-black">{label}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full mr-3">
                      <div
                        className="h-2 bg-[#991b1b] rounded-full"
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm font-medium text-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-black text-center">
              All reviews are anonymous and verified by Campus Ambassador
            </p>
          </div>
        </section>

        {/* Section: About */}
        <section ref={sectionRefs.about} className="mb-16">
          <div className="flex items-center mb-4">
            <Info className="h-6 w-6 text-[#991b1b] mr-3" />
            <h2 className="font-display text-2xl font-bold text-black">
              About
            </h2>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6">
            <p className="text-sm uppercase tracking-wide text-[#64748b] mb-2">
              About {displayCampus.name}
            </p>
            <p className="text-black leading-relaxed mb-6">
              {displayCampus.description?.trim()
                ? displayCampus.description
                : `More campus information for ${displayCampus.name} will be added soon.`}
            </p>

            {displayCampus.googleMapLink ? (
              <a
                href={displayCampus.googleMapLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#991b1b] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors"
              >
                Get a Direction
                <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <p className="text-sm text-[#64748b]">
                Direction link is not available yet for this campus.
              </p>
            )}
          </div>
        </section>

      </div>

      <Footer />
    </div>
  );
}
