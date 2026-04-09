"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, Filter, Clock, ChevronRight, FileSearch } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCampuses } from '@/hooks/useCampuses';
import { useCategories } from '@/hooks/useCategories';
import { usePublishedArticles } from '@/hooks/useArticles';
import type { ApiArticle } from '@/types/articleApi';
import { getCategoryConfig } from '@/data/articleCategories';
import { Spinner } from '@/components/ui/spinner';

export default function SearchClient() {
  const router = useRouter();
  const { campuses: apiCampuses } = useCampuses();
  const { categories: apiCategories } = useCategories();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCampus, setSelectedCampus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('Any time');

  const categoryOptions = useMemo(
    () => [{ value: 'all', label: 'All' }, ...apiCategories.map((c) => ({ value: c.slug, label: c.name }))],
    [apiCategories]
  );
  const dates = ['Any time', 'Last month', 'Last 6 months'];
  const updatedSinceDays = selectedDate === 'Last month' ? 30 : selectedDate === 'Last 6 months' ? 180 : undefined;

  const { articles: apiArticles, loading, loadMore, next } = usePublishedArticles({
    ...(query ? { search: query } : {}),
    ...(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
    ...(selectedCampus !== 'all' ? { campus: selectedCampus } : {}),
    ...(updatedSinceDays != null ? { updated_since_days: updatedSinceDays } : {}),
  });

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextQuery = searchInput.trim();
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : '/search');
  };

  const results = (apiArticles as ApiArticle[])
    .map((a) => {
      const categoryLabel = apiCategories.find((c) => c.slug === a.category)?.name ?? getCategoryConfig(a.category).label;
      return {
        id: a.id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        campus: a.campus_name ?? 'Global',
        campusId: a.campus_id,
        campusSlug: a.campus_id ? apiCampuses.find((c) => String(c.id) === String(a.campus_id))?.slug : undefined,
        categorySlug: a.category,
        categoryLabel,
        updatedDays: a.updated_days,
      };
    });

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar searchQuery={query} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-black mb-2">
          Search Results
        </h1>
        <p className="text-black mb-6">
          {query ? `Showing results for "${query}"` : 'Enter a search term to find articles'}
        </p>

        <form className="mb-6" onSubmit={handleSearchSubmit}>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search campus, topic, or article..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-[rgba(30,41,59,0.1)] rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
            />
          </div>
        </form>

        <div className="flex flex-wrap gap-4 mb-8 pb-6 border-b border-[rgba(30,41,59,0.1)]">
          <div className="relative">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="appearance-none bg-section text-black px-4 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
            >
              <option value="all">All Campuses</option>
              {apiCampuses.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-[#991b1b] text-white'
                    : 'bg-section text-black hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="appearance-none bg-section text-black px-4 py-2 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
            >
              {dates.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <Clock className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {loading ? (
            <div className="py-12 flex items-center justify-center gap-2 text-[#64748b]">
              <Spinner />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <FileSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-gray-500 mb-2">
                Nothing found for "{query || searchInput || '...'}"
              </h3>
              <p className="text-gray-400 mb-4">
                Try different keywords or change filters.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contribute" className="btn-primary text-sm">
                  Write an article
                </Link>
                <Link href="/campuses" className="btn-secondary text-sm">
                  Browse campuses
                </Link>
                <Link href="/" className="text-[#991b1b] text-sm hover:underline flex items-center">
                  Go home <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={result.campusSlug ? `/${result.campusSlug}/article/${result.slug}` : `/article/${result.slug}`}
                  className="block bg-white rounded-lg shadow-soft p-5 hover:shadow-card transition-shadow"
                >
                  <h3 className="font-display text-lg font-bold text-black mb-2">
                    {result.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="tag-campus-life">{result.campus}</span>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: getCategoryConfig(result.categorySlug).bg,
                        color: getCategoryConfig(result.categorySlug).text,
                      }}
                    >
                      {result.categoryLabel}
                    </span>
                  </div>
                  <p className="text-sm text-black mb-2">{result.excerpt}</p>
                  <div className="flex items-center text-xs text-black">
                    <Clock className="h-3 w-3 mr-1" />
                    Updated {result.updatedDays} days ago
                  </div>
                </Link>
              ))}

              {next && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => loadMore()}
                    className="w-full rounded-lg border border-[rgba(30,41,59,0.1)] bg-section py-3 text-sm font-medium text-black hover:bg-[#fbf2f3]"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
