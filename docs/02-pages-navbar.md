# Part 2 — article pages, campus page, Navbar

## `src/app/article/[slug]/page.tsx`

(Global article URL: `/article/{slug}`.)

```tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { serverCookieHeader } from '@/lib/serverCookieHeader';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import ArticleDetailPageClient from './ArticleDetailPageClient';

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

function pickArticles(data: PaginatedResponse<ApiArticle> | ApiArticle[] | null): ApiArticle[] {
  if (!data) return [];
  return Array.isArray(data) ? data : (data.results ?? []);
}

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/article/${slug}`,
    },
    robots: preview === '1'
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function ArticlePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === '1';
  const token = isPreviewMode ? (await cookies()).get('access_token')?.value : null;
  if (isPreviewMode && !token) {
    redirect('/login');
  }

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const articleRes = await fetch(
    `${API_BASE}/api/articles/articles/${encodeURIComponent(slug)}/${isPreviewMode ? 'preview/' : ''}`,
    {
      cache: isPreviewMode ? 'no-store' : 'force-cache',
      headers: {
        ...forwardCookies,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!articleRes.ok) {
    if (isPreviewMode && articleRes.status === 401) {
      redirect('/login');
    }
    notFound();
  }
  const article = (await articleRes.json()) as ApiArticle | null;
  if (!article) {
    notFound();
  }

  const categoryQuery =
    article.category_id != null && String(article.category_id).trim() !== ''
      ? `&category_id=${encodeURIComponent(String(article.category_id))}`
      : '';

  const [relatedRes, latestRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?status=published${categoryQuery}&page_size=6`,
      { next: { revalidate: 3600 }, headers: forwardCookies }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
      headers: forwardCookies,
    }),
  ]);

  const relatedJson = relatedRes.ok
    ? (await relatedRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null
    : [];
  const latestJson = latestRes.ok
    ? (await latestRes.json()) as PaginatedResponse<ApiArticle> | ApiArticle[] | null
    : [];

  const relatedArticles = pickArticles(relatedJson);
  const latestArticles = pickArticles(latestJson);
  const mergedRelated = mergeRelatedArticles(article.slug, relatedArticles, latestArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticleDetailPageClient
        article={article}
        previewMessage={
          isPreviewMode
            ? `⚠️ Preview Mode — This article is ${article.status} and not visible to the public.`
            : undefined
        }
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 pb-8 sm:pb-8">
        <RelatedArticlesSection
          articles={mergedRelated}
          mode="global"
          campusSlug=""
          campusName={article.campus_name || 'Global'}
        />
      </div>
      <Footer />
    </div>
  );
}
```

---

## `src/app/[campusSlug]/article/[articleSlug]/page.tsx`

(Campus-scoped article URL: `/{campusSlug}/article/{articleSlug}`.)

```tsx
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { serverCookieHeader } from '@/lib/serverCookieHeader';
import type { CampusListItem } from '@/types/campusApi';
import type { ApiArticle, PaginatedResponse } from '@/types/articleApi';
import Footer from '@/components/Footer';
import RelatedArticlesSection from '@/components/RelatedArticlesSection';
import { mergeRelatedArticles } from '@/lib/mergeRelatedArticles';
import ArticlePageClient from './ArticlePageClient';

type PageProps = {
  params: Promise<{ campusSlug: string; articleSlug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { campusSlug, articleSlug } = await params;
  const { preview } = await searchParams;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/${campusSlug}/article/${articleSlug}`,
    },
    robots: preview === '1'
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}

export default async function ArticlePage({ params, searchParams }: PageProps) {
  const { campusSlug, articleSlug } = await params;
  const { preview } = await searchParams;
  const isPreviewMode = preview === '1';

  const cookieHeader = await serverCookieHeader();
  const forwardCookies = cookieHeader ? { Cookie: cookieHeader } : undefined;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'force-cache',
    headers: forwardCookies,
  });
  if (!campusRes.ok) {
    notFound();
  }
  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const token = isPreviewMode ? (await cookies()).get('access_token')?.value : null;
  if (isPreviewMode && !token) {
    redirect('/login');
  }

  const articleRes = await fetch(
    `${API_BASE}/api/articles/articles/${articleSlug}/${isPreviewMode ? 'preview/' : ''}`,
    {
      cache: isPreviewMode ? 'no-store' : 'force-cache',
      headers: {
        ...forwardCookies,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
  if (!articleRes.ok) {
    if (isPreviewMode && articleRes.status === 401) {
      redirect('/login');
    }
    notFound();
  }
  const article = (await articleRes.json()) as ApiArticle | null;
  if (!article || !article.campus_id || String(article.campus_id) !== String(campusApi.id)) {
    notFound();
  }

  const categoryQuery =
    article.category_id != null && String(article.category_id).trim() !== ''
      ? `&category_id=${encodeURIComponent(String(article.category_id))}`
      : '';

  const [primaryRes, latestRes, campusesListRes] = await Promise.all([
    fetch(
      `${API_BASE}/api/articles/articles/?status=published&campus=${encodeURIComponent(String(campusApi.id))}${categoryQuery}&page_size=6`,
      { next: { revalidate: 3600 }, headers: forwardCookies }
    ),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, {
      next: { revalidate: 3600 },
      headers: forwardCookies,
    }),
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      headers: forwardCookies,
    }),
  ]);

  const primaryJson = primaryRes.ok ? await primaryRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const latestJson = latestRes.ok ? await latestRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[] : [];
  const campusesJson = campusesListRes.ok ? await campusesListRes.json() as CampusListItem[] | { results?: CampusListItem[] } : [];

  const primaryRelatedArticles = Array.isArray(primaryJson) ? primaryJson : (primaryJson.results ?? []);
  const latestPublishedArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const mergedRelated = mergeRelatedArticles(article.slug, primaryRelatedArticles, latestPublishedArticles);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticlePageClient
        campusSlug={campusSlug}
        campusName={campusApi.name}
        article={article}
        previewMessage={
          isPreviewMode
            ? `⚠️ Preview Mode — This article is ${article.status} and not visible to the public.`
            : undefined
        }
      />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full min-w-0 pb-8 sm:pb-8">
        <RelatedArticlesSection
          articles={mergedRelated}
          mode="campus"
          campusSlug={campusSlug}
          campusName={campusApi.name}
          apiCampuses={apiCampuses}
        />
      </div>
      <Footer />
    </div>
  );
}
```

---

## `src/app/[campusSlug]/page.tsx`

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { API_BASE } from '@/lib/apiBase';
import { apiCampusToCampus } from '@/lib/campusUtils';
import type { CampusListItem } from '@/types/campusApi';
import CampusPageClient from './CampusPageClient';

type PageProps = {
  params: Promise<{ campusSlug: string }>;
};

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { campusSlug } = await params;

  return {
    alternates: {
      canonical: `https://www.niatinsider.com/${campusSlug}`,
    },
  };
}

export default async function CampusPage({ params }: PageProps) {
  const { campusSlug } = await params;

  const campusRes = await fetch(`${API_BASE}/api/campuses/${campusSlug}/`, {
    cache: 'force-cache',
    credentials: 'include',
  });

  if (!campusRes.ok) {
    notFound();
  }

  const campusApi = (await campusRes.json()) as CampusListItem | null;
  if (!campusApi) {
    notFound();
  }

  const [campusesRes, articleCountRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    }),
    fetch(`${API_BASE}/api/articles/?campus=${encodeURIComponent(String(campusApi.id))}`, {
      next: { revalidate: 3600 },
      credentials: 'include',
    }),
  ]);

  const campus = apiCampusToCampus(campusApi);

  const campusesJson = campusesRes.ok ? await campusesRes.json() : [];
  const apiCampuses = (Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? [])) as CampusListItem[];

  const articleCountJson = articleCountRes.ok
    ? await articleCountRes.json() as { count?: number }
    : {};
  const articleCount = articleCountJson.count ?? 0;

  return (
    <CampusPageClient
      campus={campus}
      campusSlug={campusSlug}
      articleCount={articleCount}
      apiCampuses={apiCampuses}
    />
  );
}
```

---

## `src/components/Navbar.tsx`

```tsx
"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronRight, PenLine, UserCircle, LogOut } from 'lucide-react';
import { logout } from '../lib/authApi';
import { useCampuses } from '../hooks/useCampuses';
import { useCategories } from '../hooks/useCategories';
import { usePublishedArticles } from '../hooks/useArticles';
import { getCategoryConfig } from '../data/articleCategories';
import type { ApiArticle } from '../types/articleApi';
import WriteArticleCTA from './WriteArticleCTA';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

interface NavbarProps {
  searchQuery?: string;
  showSearch?: boolean;
}

const HOW_TO_GUIDES_LINK = { label: 'How-To Guides', icon: '📘', path: '/how-to-guides' };

export default function Navbar({ searchQuery = '', showSearch }: NavbarProps) {
  const [search, setSearch] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [articlesDropdownOpen, setArticlesDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { campuses: apiCampuses } = useCampuses();
  const { categories: apiCategories } = useCategories();
  const getCampusSlug = (campusId: string) => apiCampuses.find((c) => String(c.id) === campusId)?.slug ?? campusId;
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const niatStatus = useAuthStore((state) => state.niatStatus);
  const studentUsesFullNav = role === AUTH_ROLES.niat || role === AUTH_ROLES.intermediate;
  const hideWriteCtaForRole = role === AUTH_ROLES.niat || role === AUTH_ROLES.intermediate;
  const hideMyArticlesForRole = role === AUTH_ROLES.intermediate;
  const isAuthenticated = Boolean(user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const onboardingComplete = Boolean(isOnboarded);
  const showFullNav = isAuthenticated && (onboardingComplete || studentUsesFullNav);

  const { articles: publishedArticles, loading: recentArticlesLoading } = usePublishedArticles(
    { page_size: 12, ordering: 'updated_at' },
    { enabled: showFullNav && articlesDropdownOpen }
  );

  const isHome = pathname === '/';
  const isOnArticles = pathname === '/articles';
  const shouldShowSearch = showFullNav && (!isHome || showSearch === true);
  const shouldShowNavShadow = isHome && showSearch === true;
  const topBannerMessage = role === AUTH_ROLES.niat
    ? (niatStatus === 'pending'
      ? "Your profile is under review. We'll notify you once a moderator verifies it."
      : null)
    : role === AUTH_ROLES.intermediate
      ? null
      : 'Submit your article. It gets reviewed, then goes live for the whole community. Be the first to publish.';

  const recentlyUpdated = (publishedArticles as ApiArticle[])
    .slice(0, 12)
    .map((a) => ({
      id: String(a.id),
      slug: a.slug,
      title: a.title,
      campusId: a.campus_id != null ? String(a.campus_id) : null,
      campusName: a.campus_name ?? 'Global',
      category: a.category,
      updatedDays: a.updated_days,
    }));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  useEffect(() => {
    if (!authChecked) {
      void bootstrapAuth();
    }
  }, [authChecked, bootstrapAuth]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) setArticlesDropdownOpen(false);
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(target)) setProfileDropdownOpen(false);
    };
    if (articlesDropdownOpen || profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [articlesDropdownOpen, profileDropdownOpen]);

  const handleLogout = () => {
    void logout();
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {topBannerMessage && (
        <div
          className="bg-[#991b1b] text-white text-center text-xs sm:text-sm font-medium py-2 px-3 sm:px-4"
          role="status"
          aria-live="polite"
        >
          {topBannerMessage}
        </div>
      )}
      <nav
        className={`bg-navbar border-b border-[rgba(30,41,59,0.1)] transition-[box-shadow] duration-300 ease-out ${shouldShowNavShadow ? 'shadow-[0_2px_12px_rgba(30,41,59,0.10)]' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 shrink-0">
              <img
                src="/niat.svg"
                alt="NIAT"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#991b1b]">NIAT</span>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-black">Insider</span>
            </Link>

            <form
              onSubmit={handleSearch}
              className={`hidden md:flex mx-8 transition-[opacity,transform,width] duration-[250ms] ease-out ${shouldShowSearch
                ? `opacity-100 translate-y-0 flex-1 min-w-0 overflow-visible ${isHome ? 'max-w-[280px]' : 'max-w-md'}`
                : 'opacity-0 -translate-y-1.5 w-0 min-w-0 flex-none overflow-hidden pointer-events-none'
                }`}
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campus, topic, or article..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  suppressHydrationWarning
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-transparent"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-wrap justify-end gap-2 lg:gap-4">
              {isAuthenticated && !onboardingComplete && !studentUsesFullNav && (
                <>
                  <Link
                    href="/onboarding"
                    className="text-[#991b1b] hover:text-[#7f1d1d] text-sm font-medium transition-colors"
                  >
                    Complete profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {showFullNav && (
                <>
                  <Link
                    href="/campuses"
                    className="text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    Campuses
                  </Link>

                  {/* Articles with mega dropdown */}
                  <div
                    ref={dropdownRef}
                    className="relative shrink-0"
                    onMouseEnter={() => setArticlesDropdownOpen(true)}
                    onMouseLeave={() => setArticlesDropdownOpen(false)}
                  >
                    <Link
                      href="/articles"
                      className={`relative inline-flex items-center py-2 text-sm font-medium transition-colors min-w-[4.5rem] ${isOnArticles ? 'text-[#991b1b]' : 'text-black hover:text-black'
                        }`}
                    >
                      Articles
                      {isOnArticles && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#991b1b] rounded-full" aria-hidden />}
                    </Link>
                    {articlesDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full h-1" aria-hidden />
                    )}

                    {articlesDropdownOpen && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-[min(520px,calc(100vw-2rem))] z-50"
                      >
                        <div
                          className="rounded-xl overflow-hidden border border-[rgba(30,41,59,0.08)] bg-white shadow-lg"
                          style={{ boxShadow: '0 10px 40px rgba(30, 41, 59, 0.15)' }}
                        >
                          <div className="flex flex-col sm:flex-row max-h-[min(70vh,420px)]">
                            <div className="w-full sm:w-[220px] shrink-0 p-4 border-b sm:border-b-0 sm:border-r border-[rgba(30,41,59,0.08)]">
                              <h4 className="font-display text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                                Browse by Category
                              </h4>
                              <ul className="space-y-0.5">
                                {apiCategories.map((c) => {
                                  const style = getCategoryConfig(c.slug);
                                  return (
                                    <li key={c.slug}>
                                      <Link
                                        href={`/articles?category=${c.slug}`}
                                        onClick={() => setArticlesDropdownOpen(false)}
                                        className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-md text-[#1e293b] hover:bg-[#fbf2f3] hover:text-[#991b1b] transition-colors text-sm font-medium"
                                      >
                                        <span>{style.icon}</span>
                                        {c.name}
                                      </Link>
                                    </li>
                                  );
                                })}
                                <li className="border-t border-[rgba(30,41,59,0.08)] mt-2 pt-2">
                                  <Link
                                    href={HOW_TO_GUIDES_LINK.path}
                                    onClick={() => setArticlesDropdownOpen(false)}
                                    className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-md text-[#1e293b] hover:bg-[#fbf2f3] hover:text-[#991b1b] transition-colors text-sm font-medium"
                                  >
                                    <span>{HOW_TO_GUIDES_LINK.icon}</span>
                                    {HOW_TO_GUIDES_LINK.label}
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col p-4">
                              <h4 className="font-display text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2 shrink-0">
                                Recently Updated
                              </h4>
                              <div className="overflow-y-auto overscroll-contain flex-1 min-h-0 rounded-lg -mx-1 px-1 scroll-smooth">
                                <div className="space-y-1.5">
                                  {recentArticlesLoading && (
                                    <p className="text-xs text-[#64748b] py-2 px-1">Loading recent articles...</p>
                                  )}
                                  {!recentArticlesLoading && recentlyUpdated.length === 0 && (
                                    <p className="text-xs text-[#64748b] py-2 px-1">No recent articles yet.</p>
                                  )}
                                  {!recentArticlesLoading && recentlyUpdated.map((a) => {
                                    const config = getCategoryConfig(a.category ?? '');
                                    const categoryLabel = apiCategories.find((c) => c.slug === a.category)?.name ?? config.label;
                                    const campusIdForUrl = a.campusId != null && a.campusId !== '' ? a.campusId : '';
                                    const articleKey = a.slug || a.id;
                                    const url = campusIdForUrl
                                      ? `/${getCampusSlug(campusIdForUrl)}/article/${articleKey}`
                                      : `/article/${articleKey}`;
                                    return (
                                      <Link
                                        key={a.id}
                                        href={url}
                                        onClick={() => setArticlesDropdownOpen(false)}
                                        className="block p-2 rounded-lg hover:bg-[#fbf2f3] transition-colors group"
                                      >
                                        <h5 className="font-display text-sm font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#991b1b]">
                                          {a.title}
                                        </h5>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          <span
                                            className="text-[10px] px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: config.bg, color: config.text }}
                                          >
                                            {categoryLabel}
                                          </span>
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#991b1b] text-white">
                                            {a.campusName}
                                          </span>
                                        </div>
                                        <p className="text-xs text-[#64748b] mt-1">
                                          Updated {a.updatedDays} days ago
                                        </p>
                                      </Link>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div
                            className="px-4 py-3 border-t border-[rgba(30,41,59,0.08)] shrink-0"
                            style={{ backgroundColor: 'rgba(153, 27, 27, 0.04)' }}
                          >
                            <Link
                              href="/articles"
                              onClick={() => setArticlesDropdownOpen(false)}
                              className="inline-flex items-center gap-1 text-[#991b1b] font-medium text-sm hover:underline"
                            >
                              Browse all articles
                              <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <a
                    href ="/talk-to-seniors"
                    className="text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    Talk To Seniors
                  </a>

                  {!hideWriteCtaForRole && (
                    <WriteArticleCTA
                      label="Write Article"
                      className="btn-primary text-sm font-medium inline-flex items-center gap-1.5"
                      icon={<PenLine className="h-4 w-4" />}
                    />
                  )}
                </>
              )}
              {showFullNav && (
                <div ref={profileDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((o) => !o)}
                    className="flex cursor-pointer items-center gap-1.5 text-black hover:text-black text-sm font-medium transition-colors"
                  >
                    <UserCircle className="h-5 w-5" />
                    Profile
                  </button>
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg border border-[rgba(30,41,59,0.1)] bg-white shadow-lg z-50"
                      style={{ boxShadow: '0 4px 12px rgba(30,41,59,0.12)' }}
                    >
                      <Link
                        href="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                      {!hideMyArticlesForRole && (
                        <Link
                          href="/my-articles"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                        >
                          <PenLine className="h-4 w-4" />
                          My Articles
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!isAuthenticated && (
                <>
                  <Link href="/articles" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Articles
                  </Link>
                  <Link href="/login" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Login
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black"
              suppressHydrationWarning
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[rgba(30,41,59,0.1)]">
              {showFullNav && (
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campus, topic, or article..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      suppressHydrationWarning
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    />
                  </div>
                </form>
              )}
              <div className="flex flex-col space-y-3">
                {isAuthenticated && !onboardingComplete && !studentUsesFullNav && (
                  <>
                    <Link
                      href="/onboarding"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-[#991b1b] font-medium text-sm"
                    >
                      Complete profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="text-left text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </>
                )}
                {showFullNav && (
                  <>
                    <Link
                      href="/campuses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Campuses
                    </Link>
                    <Link
                      href="/articles"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Articles
                    </Link>
                    <a
                      href="/talk-to-seniors"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Talk To Seniors
                    </a>
                    {!hideWriteCtaForRole && (
                      <div onClick={() => setMobileMenuOpen(false)}>
                        <WriteArticleCTA
                          label="Write Article"
                          className="btn-primary text-sm font-medium text-center inline-flex items-center justify-center gap-1.5"
                          icon={<PenLine className="h-4 w-4" />}
                        />
                      </div>
                    )}
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Profile
                    </Link>
                    {!hideMyArticlesForRole && (
                      <Link href="/my-articles" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                        My Articles
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                      className="text-left text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      Logout
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <>
                    <Link href="/articles" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Articles
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
```
