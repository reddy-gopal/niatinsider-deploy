import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ChevronRight, PenLine, UserCircle, LogOut } from 'lucide-react';
import { clearTokens, fetchFoundingEditorProfile, isOnboardingComplete } from '../lib/authApi';
import { useCampuses } from '../hooks/useCampuses';
import { useCategories } from '../hooks/useCategories';
import { usePublishedArticles } from '../hooks/useArticles';
import { getCategoryConfig } from '../data/articleCategories';
import type { ApiArticle } from '../types/articleApi';

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
  const [hasToken, setHasToken] = useState(() => !!localStorage.getItem('niat_access'));
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(() => !!localStorage.getItem('niat_access'));
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { campuses: apiCampuses } = useCampuses();
  const { categories: apiCategories } = useCategories();
  const getCampusSlug = (campusId: string) => apiCampuses.find((c) => String(c.id) === campusId)?.slug ?? campusId;
  const showFullNav = hasToken && onboardingComplete;

  const { articles: publishedArticles, loading: recentArticlesLoading } = usePublishedArticles(
    { page_size: 12, ordering: 'updated_at' },
    { enabled: showFullNav && articlesDropdownOpen }
  );

  useEffect(() => {
    const update = () => {
      const token = !!localStorage.getItem('niat_access');
      setHasToken(token);
    };
    window.addEventListener('niat:auth', update);
    return () => window.removeEventListener('niat:auth', update);
  }, []);

  useEffect(() => {
    if (!hasToken) {
      setOnboardingComplete(false);
      setIsLoadingProfile(false);
      return;
    }

    setIsLoadingProfile(true);
    fetchFoundingEditorProfile()
      .then((profile) => {
        setOnboardingComplete(isOnboardingComplete(profile));
      })
      .catch(() => setOnboardingComplete(false))
      .finally(() => setIsLoadingProfile(false));
  }, [hasToken]);

  const isHome = location.pathname === '/';
  const isOnArticles = location.pathname === '/articles';
  const shouldShowSearch = showFullNav && (!isHome || showSearch === true);
  const shouldShowNavShadow = isHome && showSearch === true;

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
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

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
    clearTokens();
    window.dispatchEvent(new Event('niat:auth'));
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50">
      {/* In-progress banner — above Navbar */}
      <div
        className="bg-[#991b1b] text-white text-center text-xs sm:text-sm font-medium py-2 px-3 sm:px-4"
        role="status"
        aria-live="polite"
      >
        Submit your article. It gets reviewed, then goes live for the whole community. Be the first to publish.
      </div>
      <nav
        className={`bg-navbar border-b border-[rgba(30,41,59,0.1)] transition-[box-shadow] duration-300 ease-out ${shouldShowNavShadow ? 'shadow-[0_2px_12px_rgba(30,41,59,0.10)]' : ''
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/niat.png"
                alt="NIAT"
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain"
              />
              <span className="font-display text-xl sm:text-2xl font-bold text-[#991b1b]">NIAT</span>
              <span className="font-body text-lg sm:text-xl font-medium text-black ml-1">Insider</span>
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
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b] focus:border-transparent"
                />
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center flex-wrap justify-end gap-2 lg:gap-4">
              {isLoadingProfile ? (
                <div className="flex space-x-2 animate-pulse mb-1">
                  <div className="h-5 bg-gray-200 rounded w-28"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
              ) : hasToken && !onboardingComplete && (
                <>
                  <Link
                    to="/onboarding"
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
                    to="/campuses"
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
                      to="/articles"
                      className={`relative inline-flex items-center py-2 text-sm font-medium transition-colors min-w-[4.5rem] ${isOnArticles ? 'text-[#991b1b]' : 'text-black hover:text-black'
                        }`}
                    >
                      Articles
                      {isOnArticles && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#991b1b] rounded-full" aria-hidden />}
                    </Link>
                    {/* Invisible bridge so hover doesn't break between trigger and panel */}
                    {articlesDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full h-1" aria-hidden />
                    )}

                    {/* Mega dropdown */}
                    {articlesDropdownOpen && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 top-full pt-1 w-[min(520px,calc(100vw-2rem))] z-50"
                      >
                        <div
                          className="rounded-xl overflow-hidden border border-[rgba(30,41,59,0.08)] bg-white shadow-lg"
                          style={{ boxShadow: '0 10px 40px rgba(30, 41, 59, 0.15)' }}
                        >
                          <div className="flex flex-col sm:flex-row max-h-[min(70vh,420px)]">
                            {/* Left column - Browse by Category */}
                            <div className="w-full sm:w-[220px] shrink-0 p-4 border-b sm:border-b-0 sm:border-r border-[rgba(30,41,59,0.08)]">
                              <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">
                                Browse by Category
                              </h4>
                              <ul className="space-y-0.5">
                                {apiCategories.map((c) => {
                                  const style = getCategoryConfig(c.slug);
                                  return (
                                    <li key={c.slug}>
                                      <Link
                                        to={`/articles?category=${c.slug}`}
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
                                    to={HOW_TO_GUIDES_LINK.path}
                                    onClick={() => setArticlesDropdownOpen(false)}
                                    className="flex items-center gap-2 py-2 px-2 -mx-2 rounded-md text-[#1e293b] hover:bg-[#fbf2f3] hover:text-[#991b1b] transition-colors text-sm font-medium"
                                  >
                                    <span>{HOW_TO_GUIDES_LINK.icon}</span>
                                    {HOW_TO_GUIDES_LINK.label}
                                  </Link>
                                </li>
                              </ul>
                            </div>

                            {/* Right column - Recently Updated only (scrollable) */}
                            <div className="flex-1 min-w-0 flex flex-col p-4">
                              <h4 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2 shrink-0">
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
                                      ? `/campus/${getCampusSlug(campusIdForUrl)}/article/${articleKey}`
                                      : `/article/${articleKey}`;
                                    return (
                                      <Link
                                        key={a.id}
                                        to={url}
                                        onClick={() => setArticlesDropdownOpen(false)}
                                        className="block p-2 rounded-lg hover:bg-[#fbf2f3] transition-colors group"
                                      >
                                        <h5 className="font-playfair text-sm font-bold text-[#1e293b] line-clamp-1 group-hover:text-[#991b1b]">
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

                          {/* Bottom - Browse all articles */}
                          <div
                            className="px-4 py-3 border-t border-[rgba(30,41,59,0.08)] shrink-0"
                            style={{ backgroundColor: 'rgba(153, 27, 27, 0.04)' }}
                          >
                            <Link
                              to="/articles"
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

                  <Link to="/contribute/write" className="btn-primary text-sm font-medium inline-flex items-center gap-1.5">
                    <PenLine className="h-4 w-4" />
                    Write Article
                  </Link>
                </>
              )}
              {showFullNav && (
                <div ref={profileDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen((o) => !o)}
                    className="flex items-center gap-1.5 text-black hover:text-black text-sm font-medium transition-colors"
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
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/my-articles"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#1e293b] hover:bg-[#fbf2f3] transition-colors"
                      >
                        <PenLine className="h-4 w-4" />
                        My Articles
                      </Link>
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
              {!hasToken && (
                <>
                  <Link to="/login" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="text-black hover:text-black text-sm font-medium transition-colors">
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-black"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
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
                      className="w-full pl-10 pr-4 py-2 bg-white border border-[rgba(30,41,59,0.1)] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
                    />
                  </div>
                </form>
              )}
              <div className="flex flex-col space-y-3">
                {isLoadingProfile ? (
                  <div className="flex flex-col space-y-4 animate-pulse mt-2 py-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ) : hasToken && !onboardingComplete && (
                  <>
                    <Link
                      to="/onboarding"
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
                      to="/campuses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-black hover:text-black text-sm font-medium"
                    >
                      Campuses
                    </Link>
                    <Link
                      to="/articles"
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
                    <Link
                      to="/contribute/write"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-primary text-sm font-medium text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <PenLine className="h-4 w-4" />
                      Write Article
                    </Link>
                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Profile
                    </Link>
                    <Link to="/my-articles" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      My Articles
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
                {!hasToken && (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-black hover:text-black text-sm font-medium">
                      Register
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
