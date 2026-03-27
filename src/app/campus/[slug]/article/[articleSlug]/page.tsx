"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Clock, Pencil, Trash2, MoreVertical, ThumbsUp, Eye } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ImageWithFallback from '@/components/ImageWithFallback';
import { ArticleSuggestionForm } from '@/components/ArticleSuggestionForm';
import { ArticleStructuredData } from '@/components/ArticleStructuredData';
import { useCampuses } from '@/hooks/useCampuses';
import { CATEGORY_CONFIG } from '@/data/articleCategories';
import { useArticleDetail, usePublishedArticles } from '@/hooks/useArticles';
import { useUpvote } from '@/hooks/useUpvote';
import { articleService } from '@/lib/articleService';
import { fetchMe } from '@/lib/authApi';

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
  const raw =
    candidate.author_linkedin_profile ??
    candidate.author_linkedin ??
    candidate.linkedin_profile;
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const handle = value.replace(/^@/, '');
  return `https://www.linkedin.com/in/${handle}`;
}

export default function Article() {
  const params = useParams();
  const campusSlug = params.slug as string;
  const articleSlug = params.articleSlug as string;
  const isGlobalRoute = !campusSlug;
  const articleSlugParam = articleSlug?.trim() || null;

  const { campuses: apiCampuses } = useCampuses();
  const campus = useMemo(() => {
    if (!campusSlug || !apiCampuses.length) return null;
    const item = apiCampuses.find((c) => c.slug === campusSlug);
    return item ?? null;
  }, [apiCampuses, campusSlug]);

  const { article: apiArticle, loading, error } = useArticleDetail(articleSlugParam);
  const authorLinkedIn = useMemo(() => resolveAuthorLinkedIn(apiArticle), [apiArticle]);
  const fromApi = !loading && !!apiArticle;
  const notFound = !loading && articleSlugParam != null && !apiArticle;
  const relatedFilterParams = fromApi && apiArticle
    ? {
        ...(apiArticle.campus_id ? { campus: String(apiArticle.campus_id) } : {}),
        ...(apiArticle.category_id ? { category_id: String(apiArticle.category_id) } : {}),
        page_size: 6,
      }
    : undefined;
  const { articles: primaryRelatedArticles } = usePublishedArticles(
    relatedFilterParams,
    { enabled: !!(fromApi && apiArticle) }
  );
  const { articles: latestPublishedArticles } = usePublishedArticles(
    { page_size: 12 },
    { enabled: !!(fromApi && apiArticle) }
  );

  const article = loading
    ? {
        title: '',
        excerpt: '',
        updatedDays: 0,
        upvoteCount: 0,
        viewCount: 0,
        author: '',
        category: 'onboarding-kit' as const,
        campusName: '',
        coverImage: undefined,
        status: undefined as string | undefined,
        rejectionReason: undefined as string | undefined,
      }
    : fromApi && apiArticle
      ? {
          title: apiArticle.title,
          excerpt: apiArticle.excerpt,
          updatedDays: apiArticle.updated_days,
          upvoteCount: apiArticle.upvote_count,
          viewCount: apiArticle.view_count,
          author: apiArticle.author_username,
          category: apiArticle.category,
          campusName: apiArticle.campus_name,
          coverImage: apiArticle.cover_image || undefined,
          status: apiArticle.status,
          rejectionReason: apiArticle.rejection_reason,
        }
      : {
          title: notFound ? 'Article not found' : '',
          excerpt: '',
          updatedDays: 0,
          upvoteCount: 0,
          viewCount: 0,
          author: '',
          category: 'academics' as const,
          campusName: 'Global',
          coverImage: undefined,
          status: undefined as string | undefined,
          rejectionReason: undefined as string | undefined,
        };

  const articleIdForEngagement = fromApi && apiArticle ? apiArticle.id : null;
  const { upvoteCount, upvoted, toggle } = useUpvote(articleIdForEngagement);

  const displayUpvoteCount = fromApi ? upvoteCount : article.upvoteCount;
  const [viewIncremented, setViewIncremented] = useState(false);
  const displayViewCount = (article.viewCount ?? 0) + (viewIncremented ? 1 : 0);

  useEffect(() => {
    if (articleIdForEngagement == null) return;
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

  const categoryConfig = CATEGORY_CONFIG[article.category as keyof typeof CATEGORY_CONFIG];
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!optionsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) setOptionsOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [optionsOpen]);

  // All article images for carousel; avoid duplication with body (body will strip image cards)
  const articleImages =
    fromApi && apiArticle?.images?.length
      ? apiArticle.images
      : article.coverImage
        ? [article.coverImage]
        : [];
  const hasMultipleImages = articleImages.length > 1;
  const campusSlugForId = (id: string | number | null | undefined): string | null => {
    if (id == null) return null;
    if (String(id) === String(campus?.id ?? '')) return campusSlug;
    return apiCampuses.find((c) => String(c.id) === String(id))?.slug ?? null;
  };
  const relatedArticles = useMemo(() => {
    if (!fromApi || !apiArticle) return [];
    const currentSlug = apiArticle.slug;
    const seen = new Set<string>([currentSlug]);
    const merged: typeof primaryRelatedArticles = [];

    for (const item of primaryRelatedArticles) {
      if (!item?.slug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      merged.push(item);
      if (merged.length >= 3) return merged;
    }
    for (const item of latestPublishedArticles) {
      if (!item?.slug || seen.has(item.slug)) continue;
      seen.add(item.slug);
      merged.push(item);
      if (merged.length >= 3) break;
    }
    return merged;
  }, [fromApi, apiArticle, primaryRelatedArticles, latestPublishedArticles]);
  const relatedCtaCampusSlug = fromApi && apiArticle
    ? (campusSlugForId(apiArticle.campus_id) ?? campusSlug)
    : campusSlug;
  const relatedCtaHref = relatedCtaCampusSlug ? `/articles?campus=${relatedCtaCampusSlug}` : '/articles';
  const relatedCtaLabel = fromApi && apiArticle?.campus_name
    ? `See all ${apiArticle.campus_name} articles \u2192`
    : 'See all articles \u2192';

  useEffect(() => {
    fetchMe().then((me) => setCurrentUsername(me?.username ?? null));
  }, []);

  useEffect(() => {
    setCarouselIndex(0);
  }, [articleSlugParam]);

  const isAuthor = fromApi && apiArticle && currentUsername && apiArticle.author_username === currentUsername;

  const handleDeleteArticle = () => {
    if (!fromApi || !apiArticle || deleteLoading) return;
    setDeleteLoading(true);
    articleService
      .delete(apiArticle.id)
      .then(() => {
        setDeleteConfirmOpen(false);
        router.push(isGlobalRoute ? '/articles' : `/campus/${campusSlug ?? ''}`);
      })
      .finally(() => setDeleteLoading(false));
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-xl font-medium text-[#1e293b] mb-2">Article not found</p>
          <p className="text-[#64748b] mb-4">{error ?? 'This article may have been removed or the link is invalid.'}</p>
          <Link href={isGlobalRoute ? '/articles' : `/campus/${campusSlug ?? ''}`} className="text-[#991b1b] font-medium hover:underline">
            ← Back to {isGlobalRoute ? 'Articles' : 'Campus'}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {fromApi && apiArticle && (
        <ArticleStructuredData
          title={article.title}
          description={article.excerpt}
          authorUsername={article.author}
          publishedAt={apiArticle.published_at ?? null}
          coverImage={article.coverImage}
          slug={apiArticle.slug}
          isGlobalRoute={false}
        />
      )}
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full min-w-0">
        {/* Breadcrumb */}
        <nav className="flex items-center text-black text-sm mb-6 flex-wrap gap-1">
          <Link href="/" className="hover:text-[#991b1b]">Home</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          {isGlobalRoute ? (
            fromApi && apiArticle?.is_global_guide ? (
              <>
                <Link href="/how-to-guides" className="hover:text-[#991b1b]">How-To Guides</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
              </>
            ) : (
              <>
                <Link href="/articles" className="hover:text-[#991b1b]">Articles</Link>
                <ChevronRight className="h-4 w-4 mx-1" />
                <span
                  className="truncate max-w-xs"
                  style={{ color: categoryConfig?.text ?? '#991b1b' }}
                >
                  {categoryConfig?.label ?? 'Article'}
                </span>
                <ChevronRight className="h-4 w-4 mx-1" />
              </>
            )
          ) : (
            <>
              <Link href={`/campus/${campusSlug ?? ''}`} className="hover:text-[#991b1b]">
                {campus?.name ?? 'Campus'}
              </Link>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span
                className="truncate max-w-xs"
                style={{ color: categoryConfig?.text ?? '#991b1b' }}
              >
                {categoryConfig?.label ?? 'Article'}
              </span>
              <ChevronRight className="h-4 w-4 mx-1" />
            </>
          )}
          <span className="text-black truncate max-w-xs">{article.title}</span>
        </nav>

        {/* Category Pills */}
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
              article.campusName === 'Global'
                ? { backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #94a3b8' }
                : { backgroundColor: '#991b1b', color: 'white', border: '1px solid #991b1b' }
            }
          >
            {article.campusName}
          </span>
        </div>

        {/* Status banner for author viewing own article */}
        {'status' in article && article.status && article.status !== 'published' && (
          <div
            className={`mb-4 p-4 rounded-xl border ${article.status === 'rejected' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}
          >
            <p className="font-medium">{article.status === 'rejected' ? 'Rejected' : 'Under Review'}</p>
            {'rejectionReason' in article && article.rejectionReason && (
              <p className="text-sm mt-1">{article.rejectionReason}</p>
            )}
          </div>
        )}

        {/* Article Title + Options (top) */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="font-display text-2xl md:text-4xl font-bold text-black min-w-0 flex-1">
            {article.title}
          </h1>
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
                <div
                  className="absolute right-0 top-full mt-1 py-1 min-w-[180px] rounded-lg bg-white border shadow-lg z-10"
                  style={{ borderColor: 'rgba(30,41,59,0.12)' }}
                >
                  <Link
                    href={`/contribute/write?edit=${apiArticle!.id}`}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-[#1e293b] hover:bg-[#fbf2f3]"
                    onClick={() => setOptionsOpen(false)}
                  >
                    <Pencil className="h-4 w-4 text-[#991b1b]" />
                    Edit article
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOptionsOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete article
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {loading && (
          <div className="flex justify-center py-16 mb-8">
            <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
          </div>
        )}

        {!loading && articleImages.length > 0 && (
          <div className="w-full mb-6 rounded-xl overflow-hidden bg-[rgba(30,41,59,0.06)]">
            {hasMultipleImages ? (
              <div className="relative">
                <div className="flex items-center justify-center min-h-[200px] max-h-[70vh]">
                  <ImageWithFallback
                    key={carouselIndex}
                    src={articleImages[carouselIndex]}
                    alt={`${article.title} — image ${carouselIndex + 1}`}
                    className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => (i === 0 ? articleImages.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCarouselIndex((i) => (i === articleImages.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {articleImages.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCarouselIndex(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${i === carouselIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/70'}`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[240px] md:min-h-[320px] max-h-[70vh]">
                <ImageWithFallback
                  src={articleImages[0]}
                  alt={article.title}
                  className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
                />
              </div>
            )}
          </div>
        )}

        {!loading && (
          <>
        {/* Article Body — API body or excerpt */}
        {fromApi && apiArticle?.body ? (
          <div className="article-body-read-only">
            <article
              className="prose prose-lg max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: stripImageCardsFromHtml(apiArticle.body) }}
            />
          </div>
        ) : (
          <article className="prose prose-lg max-w-none mb-8">
            <p className="text-black leading-relaxed">{article.excerpt}</p>
          </article>
        )}

        {/* Meta Row — below body */}
        <div className="text-sm text-black mb-6 pb-6 border-t border-[rgba(30,41,59,0.1)] pt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span>Written by {article.author}</span>
            {authorLinkedIn && (
              <a
                href={authorLinkedIn}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#0a66c2] hover:underline"
              >
                <FontAwesomeIcon icon={faLinkedin} style={{ color: 'rgb(52, 101, 216)' }} />
                LinkedIn
              </a>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated {article.updatedDays} days ago
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {displayUpvoteCount} upvote{displayUpvoteCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {displayViewCount} view{displayViewCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Upvote + Suggest (API articles only) — below body */}
        {fromApi && articleIdForEngagement != null && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {currentUsername != null && (
              <button
                type="button"
                onClick={toggle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  upvoted
                    ? 'bg-[#991b1b] border-[#991b1b] text-white'
                    : 'border-[#991b1b] text-[#991b1b] hover:bg-[#fbf2f3]'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                {upvoted ? 'Upvoted' : 'Upvote'}
              </button>
            )}
            {currentUsername != null && (
              <ArticleSuggestionForm
                articleId={articleIdForEngagement}
                onSubmit={(payload) => articleService.submitSuggestion(articleIdForEngagement, payload).then(() => undefined)}
              />
            )}
          </div>
        )}

        {relatedArticles.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl md:text-2xl font-bold text-[#1e293b] mb-4">
              More from NIAT Insider
            </h2>
            <div className="divide-y divide-[rgba(30,41,59,0.08)]">
              {relatedArticles.map((related) => {
                const relatedCampusSlug = campusSlugForId(related.campus_id);
                const relatedHref = relatedCampusSlug
                  ? `/campus/${relatedCampusSlug}/article/${related.slug}`
                  : `/article/${related.slug}`;
                return (
                  <Link
                    key={related.id}
                    href={relatedHref}
                    className="group flex gap-4 py-4 border-l-[3px] border-l-transparent pl-3 transition-all duration-150 ease-out hover:border-l-[#991b1b]"
                  >
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
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <Link
                href={relatedCtaHref}
                className="inline-flex items-center gap-1 text-[#991b1b] font-medium text-sm hover:underline"
              >
                {relatedCtaLabel}
              </Link>
            </div>
          </section>
        )}

        {/* Delete confirmation modal */}
        {deleteConfirmOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-50" onClick={() => !deleteLoading && setDeleteConfirmOpen(false)} aria-hidden />
            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 p-6 rounded-xl bg-white shadow-xl">
              <h3 className="font-display text-lg font-bold text-black mb-2">Delete this article?</h3>
              <p className="text-sm text-black/80 mb-6">This cannot be undone. The article will be permanently removed.</p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => !deleteLoading && setDeleteConfirmOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-black hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteArticle}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleteLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="animate-spin rounded-full border-2 border-white/40 border-t-white size-4 shrink-0" role="status" aria-label="Deleting" />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
                </button>
              </div>
            </div>
          </>
        )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
