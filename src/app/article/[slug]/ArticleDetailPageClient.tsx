"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Clock, Pencil, Trash2, MoreVertical, ThumbsUp, Eye } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { ArticleSuggestionForm } from '@/components/ArticleSuggestionForm';
import { ArticleStructuredData } from '@/components/ArticleStructuredData';
import { CATEGORY_CONFIG } from '@/data/articleCategories';
import { useUpvote } from '@/hooks/useUpvote';
import { articleService } from '@/lib/articleService';
import { fetchMe } from '@/lib/authApi';
import type { ApiArticle } from '@/types/articleApi';

/** Remove article-image-card blocks so images are shown only in the carousel (no duplication). */
function stripImageCardsFromHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  if (typeof document === 'undefined') return html;
  const div = document.createElement('div');
  div.innerHTML = html;
  const cards = div.querySelectorAll('.article-image-card');
  cards.forEach((el) => el.remove());
  return div.innerHTML.trim();
}

function resolveAuthorLinkedIn(article: unknown): string | null {
  if (!article || typeof article !== 'object') return null;
  const candidate = article as Record<string, unknown>;
  const raw = candidate.author_linkedin_profile ?? candidate.author_linkedin ?? candidate.linkedin_profile;
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const handle = value.replace(/^@/, '');
  return `https://www.linkedin.com/in/${handle}`;
}

type Props = {
  article: ApiArticle;
  relatedArticles: ApiArticle[];
  latestArticles: ApiArticle[];
};

export default function ArticleDetailPageClient({ article, relatedArticles, latestArticles }: Props) {
  const authorLinkedIn = useMemo(() => resolveAuthorLinkedIn(article), [article]);
  const articleIdForEngagement = article.id;
  const { upvoteCount, upvoted, toggle } = useUpvote(articleIdForEngagement);
  const [viewIncremented, setViewIncremented] = useState(false);
  const displayViewCount = (article.view_count ?? 0) + (viewIncremented ? 1 : 0);
  const categoryConfig = CATEGORY_CONFIG[article.category as keyof typeof CATEGORY_CONFIG];
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  const articleImages = article?.images?.length ? article.images : article.cover_image ? [article.cover_image] : [];
  const hasMultipleImages = articleImages.length > 1;

  const mergedRelated = useMemo(() => {
    const seen = new Set<string>([article.slug]);
    const merged: ApiArticle[] = [];
    for (const item of relatedArticles) {
      if (!item?.slug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      merged.push(item);
      if (merged.length >= 3) return merged;
    }
    for (const item of latestArticles) {
      if (!item?.slug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      merged.push(item);
      if (merged.length >= 3) break;
    }
    return merged;
  }, [article.slug, relatedArticles, latestArticles]);

  useEffect(() => {
    const key = `viewed_article_${articleIdForEngagement}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
      setViewIncremented(true);
      articleService.incrementView(articleIdForEngagement).catch(() => {});
    } catch {
      articleService.incrementView(articleIdForEngagement).catch(() => {});
    }
  }, [articleIdForEngagement]);

  useEffect(() => {
    if (!optionsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setOptionsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [optionsOpen]);

  useEffect(() => {
    fetchMe().then((me) => setCurrentUsername(me?.username ?? null));
  }, []);

  useEffect(() => {
    setCarouselIndex(0);
  }, [article.slug]);

  const isAuthor = currentUsername != null && article.author_username === currentUsername;

  const handleDeleteArticle = () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    articleService
      .delete(article.id)
      .then(() => {
        setDeleteConfirmOpen(false);
        router.push('/articles');
      })
      .finally(() => setDeleteLoading(false));
  };

  const relatedCtaLabel = article.campus_name ? `See all ${article.campus_name} articles \u2192` : 'See all articles \u2192';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <ArticleStructuredData
        title={article.title}
        description={article.excerpt}
        authorUsername={article.author_username}
        publishedAt={article.published_at ?? null}
        coverImage={article.cover_image || undefined}
        slug={article.slug}
        isGlobalRoute={true}
      />
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
        <nav className="flex items-center text-black text-sm mb-6 flex-wrap gap-1">
          <Link href="/" className="hover:text-[#991b1b]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          {article.is_global_guide ? (
            <>
              <Link href="/how-to-guides" className="hover:text-[#991b1b]">How-To Guides</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
            </>
          ) : (
            <>
              <Link href="/articles" className="hover:text-[#991b1b]">Articles</Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="truncate max-w-xs" style={{ color: categoryConfig?.text ?? '#991b1b' }}>
                {categoryConfig?.label ?? 'Article'}
              </span>
              <ChevronRight className="h-4 w-4 mx-1" />
            </>
          )}
          <span className="text-black truncate max-w-xs">{article.title}</span>
        </nav>

        <div className="flex gap-2 mb-4">
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={{
              backgroundColor: categoryConfig?.bg ?? '#fbf2f3',
              color: categoryConfig?.text ?? '#991b1b',
              border: `1px solid ${categoryConfig?.border ?? '#991b1b'}`,
            }}
          >
            {categoryConfig?.label ?? 'Article'}
          </span>
          <span
            className="text-xs font-medium px-2 py-1 rounded-full"
            style={
              article.campus_name === 'Global'
                ? { backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #94a3b8' }
                : { backgroundColor: '#991b1b', color: 'white', border: '1px solid #991b1b' }
            }
          >
            {article.campus_name || 'Global'}
          </span>
        </div>

        {article.status && article.status !== 'published' && (
          <div className={`mb-4 p-4 rounded-xl border ${article.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
            <p className="font-medium">{article.status === 'rejected' ? 'Rejected' : 'Under Review'}</p>
            {article.rejection_reason && <p className="text-sm mt-1">{article.rejection_reason}</p>}
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-black min-w-0 flex-1">{article.title}</h1>
          {isAuthor && (
            <div className="relative shrink-0" ref={optionsRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOptionsOpen((v) => !v);
                }}
                className="p-2 rounded-lg text-[#64748b] hover:bg-[rgba(30,41,59,0.08)] hover:text-[#1e293b] transition-colors"
                aria-label="Article options"
                aria-expanded={optionsOpen}
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              {optionsOpen && (
                <div className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg bg-white border shadow-lg z-10" style={{ borderColor: 'rgba(30,41,59,0.12)' }}>
                  <Link href={`/contribute/write?edit=${article.id}`} className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-[#1e293b] hover:bg-[#fbf2f3]" onClick={() => setOptionsOpen(false)}>
                    <Pencil className="h-4 w-4 text-[#991b1b]" />Edit article
                  </Link>
                  <button type="button" onClick={() => { setOptionsOpen(false); setDeleteConfirmOpen(true); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />Delete article
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {articleImages.length > 0 && (
          <div className="w-full mb-6 rounded-xl overflow-hidden bg-[rgba(30,41,59,0.06)]">
            {hasMultipleImages ? (
              <div className="relative">
                <div className="flex items-center justify-center min-h-[200px] max-h-[70vh]">
                  <ImageWithFallback key={carouselIndex} src={articleImages[carouselIndex]} alt={`${article.title} — image ${carouselIndex + 1}`} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" />
                </div>
                <button type="button" onClick={() => setCarouselIndex((i) => (i === 0 ? articleImages.length - 1 : i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors" aria-label="Previous image"><ChevronLeft className="h-5 w-5" /></button>
                <button type="button" onClick={() => setCarouselIndex((i) => (i === articleImages.length - 1 ? 0 : i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors" aria-label="Next image"><ChevronRight className="h-5 w-5" /></button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {articleImages.map((_, i) => (<button key={i} type="button" onClick={() => setCarouselIndex(i)} className={`w-2 h-2 rounded-full transition-colors ${i === carouselIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`} aria-label={`Go to image ${i + 1}`} />))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[240px] md:min-h-[320px] max-h-[70vh]"><ImageWithFallback src={articleImages[0]} alt={article.title} className="max-w-full max-h-[70vh] w-auto h-auto object-contain" /></div>
            )}
          </div>
        )}

        {article.body ? (
          <div className="article-body-read-only"><article className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: stripImageCardsFromHtml(article.body) }} /></div>
        ) : (
          <article className="prose prose-lg max-w-none mb-8"><p className="text-black leading-relaxed">{article.excerpt}</p></article>
        )}
        <div className="text-sm text-black mb-6 pb-6 border-t border-[rgba(30,41,59,0.1)] pt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Written by {article.author_username}</span>
            {authorLinkedIn && (
              <a href={authorLinkedIn} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline">
                <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} />
                LinkedIn
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Last updated {article.updated_days} days ago</span>
            <span className="flex items-center gap-1"><ThumbsUp className="h-4 w-4" />{upvoteCount} upvote{upvoteCount !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{displayViewCount} view{displayViewCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {currentUsername != null && <button type="button" onClick={toggle} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${upvoted ? 'bg-[#991b1b] border-[#991b1b] text-white' : 'border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3]'}`}><ThumbsUp className="h-4 w-4" />{upvoted ? 'Upvoted' : 'Upvote'}</button>}
          {currentUsername != null && <ArticleSuggestionForm articleId={articleIdForEngagement} onSubmit={(payload) => articleService.submitSuggestion(articleIdForEngagement, payload).then(() => undefined)} />}
        </div>
        {mergedRelated.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-[#1e293b] mb-4">More from NIAT Insider</h2>
            <div className="divide-y divide-[rgba(30,41,59,0.08)]">
              {mergedRelated.map((related) => (
                <Link key={related.id} href={`/article/${related.slug}`} className="group flex gap-4 py-4 border-l-[3px] border-l-transparent pl-3 transition-all duration-150 ease-out hover:border-l-[#991b1b]">
                  {related.cover_image && (
                    <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden hidden sm:block">
                      <ImageWithFallback src={related.cover_image} alt={related.title} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-[18px] md:text-[20px] leading-snug font-bold text-[#1e293b] mb-1 line-clamp-2 group-hover:text-[#991b1b]">
                      {related.title}
                    </h3>
                    <p className="text-[15px] leading-relaxed text-[#334155] line-clamp-2 mb-2">
                      {related.excerpt}
                    </p>
                    <p className="text-[13px] text-[#64748b]">
                      {related.campus_name || 'Global'} · Updated {related.updated_days} days ago
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link href="/articles" className="inline-flex items-center gap-1 text-[#991b1b] font-medium text-sm hover:underline">
                {relatedCtaLabel}
              </Link>
            </div>
          </section>
        )}
        {deleteConfirmOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !deleteLoading && setDeleteConfirmOpen(false)} aria-hidden />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 p-6 rounded-xl bg-white shadow-xl">
              <h3 className="font-display text-lg font-bold text-black mb-2">Delete this article?</h3>
              <p className="text-sm text-black/80 mb-6">This cannot be undone. The article will be permanently removed.</p>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => !deleteLoading && setDeleteConfirmOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-50">Cancel</button>
                <button type="button" onClick={handleDeleteArticle} disabled={deleteLoading} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60">
                  {deleteLoading ? (<span className="inline-flex items-center gap-2"><span className="animate-spin rounded-full border-2 border-white/40 border-t-white size-4 shrink-0" role="status" aria-label="Deleting" />Deleting…</span>) : ('Delete')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
