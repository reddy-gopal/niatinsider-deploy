"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ThumbsUp, 
  Eye, 
  FileText, 
  ChevronRight, 
  Linkedin, 
  Award, 
  Calendar, 
  MapPin,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { usePublishedArticles } from '@/hooks/useArticles';
import { useCampuses } from '@/hooks/useCampuses';

export default function AuthorProfile() {
  const params = useParams();
  const username = decodeURIComponent(params.username as string);
  
  const { articles, loading, error, loadMore, next, loadingMore } = usePublishedArticles({ 
    author_username: username 
  });
  const { campuses } = useCampuses();

  // Extract author info from the first article if no dedicated profile API
  const authorInfo = useMemo(() => {
    if (articles.length === 0) return null;
    const first = articles[0];
    return {
      name: first.author_username,
      campus: first.campus_name || "Global",
      linkedin: first.author_linkedin_profile,
      campusId: first.campus_id,
      campusSlug: campuses.find(c => String(c.id) === String(first.campus_id))?.slug
    };
  }, [articles, campuses]);

  const stats = useMemo(() => {
    return articles.reduce(
      (acc, curr) => ({
        totalViews: acc.totalViews + (curr.view_count || 0),
        totalLikes: acc.totalLikes + (curr.upvote_count || 0),
        articleCount: articles.length,
      }),
      { totalViews: 0, totalLikes: 0, articleCount: 0 }
    );
  }, [articles]);

  const achievements = useMemo(() => {
    const list = [];
    if (stats.articleCount >= 1) list.push({ icon: Award, label: "Campus Pioneer", color: "text-blue-500", bg: "bg-blue-50" });
    if (stats.articleCount >= 5) list.push({ icon: FileText, label: "Top Contributor", color: "text-amber-500", bg: "bg-amber-50" });
    if (stats.totalLikes >= 10) list.push({ icon: ThumbsUp, label: "Highly Respected", color: "text-[#991b1b]", bg: "bg-red-50" });
    return list;
  }, [stats]);

  if (loading && articles.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#991b1b]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || (articles.length === 0 && !loading)) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Author not found</h2>
          <p className="text-gray-600 mb-8">We couldn&apos;t find any articles by &quot;{username}&quot;</p>
          <Link href="/articles" className="text-[#991b1b] font-medium hover:underline">
            ← Browse all articles
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Compact Header */}
        <header className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#fbf2f3] flex items-center justify-center text-[#991b1b] text-3xl md:text-4xl font-bold border-2 border-white shadow-sm ring-1 ring-gray-100 uppercase">
              {username.charAt(0)}
            </div>
            {achievements.length > 0 && (
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-50">
                {(() => {
                  const Icon = achievements[0].icon;
                  return <Icon className={`h-6 w-6 ${achievements[0].color}`} />;
                })()}
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{username}</h1>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-x-4 gap-y-2 text-gray-600 mb-4">
              <span className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                {authorInfo?.campus || "Global"}
              </span>
              <span className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                Joined March 2025
              </span>
              {authorInfo?.linkedin && (
                <a 
                  href={authorInfo.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center text-sm text-[#0a66c2] hover:underline"
                >
                  <Linkedin className="h-4 w-4 mr-1.5" />
                  LinkedIn
                </a>
              )}
            </div>
            <p className="text-gray-600 text-lg leading-relaxed max-w-2xl italic">
              &quot;Helping fellow students survive and thrive at NIAT campuses.&quot;
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12">
          {/* Main Content: Contribution Feed */}
          <section>
            <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
              <h2 className="text-xl font-bold text-gray-900">Contributions</h2>
              <span className="text-sm text-gray-500">{stats.articleCount} Articles</span>
            </div>
            
            <div className="space-y-8">
              {articles.map((article) => {
                const articleCampusSlug = campuses.find(c => String(c.id) === String(article.campus_id))?.slug;
                const articleHref = articleCampusSlug 
                  ? `/campus/${articleCampusSlug}/article/${article.slug}`
                  : `/article/${article.slug}`;

                return (
                  <Link 
                    key={article.id} 
                    href={articleHref}
                    className="group block border-l-[3px] border-transparent hover:border-[#991b1b] pl-0 transition-all duration-200"
                  >
                    <div className="flex gap-4 md:gap-6">
                      {article.cover_image && (
                        <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-50 hidden sm:block">
                          <ImageWithFallback 
                            src={article.cover_image} 
                            alt={article.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#991b1b] bg-red-50 px-2 py-0.5 rounded">
                            {article.category}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            {article.campus_name || "Global"}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#991b1b] transition-colors mb-2 line-clamp-2 leading-snug">
                          {article.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2 md:line-clamp-3 mb-3 leading-relaxed">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-[13px] text-gray-400">
                          <span className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            {article.updated_days}d ago
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                            {article.upvote_count}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {article.view_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {next && (
              <div className="mt-12 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-900 hover:border-[#991b1b] hover:text-[#991b1b] transition-all disabled:opacity-50"
                >
                  {loadingMore ? "Loading..." : "Load more contributions"}
                </button>
              </div>
            )}
          </section>

          {/* Sidebar: Stats & Achievements */}
          <aside className="space-y-10">
            {/* Subtle Stats */}
            <div className="bg-[#fbf2f3]/30 rounded-2xl p-6 border border-[#fbf2f3]">
              <h3 className="text-sm font-bold text-[#991b1b] uppercase tracking-wider mb-6">Author Stats</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Total Content Views</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLikes}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Impact (Upvotes)</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{stats.articleCount}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Articles Published</p>
                </div>
              </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Milestones</h3>
                <div className="space-y-3">
                  {achievements.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-lg ${item.bg}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contextual CTA */}
            <div className="p-6 bg-navbar rounded-2xl">
              <h3 className="font-bold text-gray-900 mb-2">Want to help out?</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Join {username} and 200+ other students sharing their campus secrets.
              </p>
              <Link
                href="/contribute"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#991b1b] hover:underline"
              >
                Learn how to contribute <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
