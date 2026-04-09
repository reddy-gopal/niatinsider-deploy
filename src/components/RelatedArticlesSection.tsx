import Link from 'next/link';
import type { ApiArticle } from '@/types/articleApi';
import type { CampusListItem } from '@/types/campusApi';

type Props = {
  articles: ApiArticle[];
  mode: 'global' | 'campus';
  /** Current page campus slug (campus route); on global route pass `''` or unused. */
  campusSlug: string;
  /** Display name for CTA copy */
  campusName: string;
  apiCampuses?: CampusListItem[];
};

function hrefForArticle(
  article: ApiArticle,
  mode: Props['mode'],
  campusSlug: string,
  apiCampuses?: CampusListItem[]
): string {
  if (mode === 'global') {
    return `/article/${article.slug}`;
  }
  const slug =
    article.campus_id != null
      ? apiCampuses?.find((c) => String(c.id) === String(article.campus_id))?.slug ?? campusSlug
      : campusSlug;
  return `/${slug}/article/${article.slug}`;
}

/**
 * Server-rendered related links (no client JS required) so anonymous users and crawlers
 * receive real <a href> in the HTML response.
 */
export default function RelatedArticlesSection({
  articles,
  mode,
  campusSlug,
  campusName,
  apiCampuses,
}: Props) {
  if (articles.length === 0) return null;

  const footerHref = mode === 'global' ? '/articles' : `/${campusSlug}`;
  const footerLabel =
    mode === 'global'
      ? campusName && campusName !== 'Global'
        ? `See all ${campusName} articles →`
        : 'See all articles →'
      : `See all ${campusName} articles →`;

  return (
    <section className="mb-8" aria-labelledby="related-articles-heading">
      <h2
        id="related-articles-heading"
        className="font-display text-xl md:text-2xl font-bold text-[#1e293b] mb-4"
      >
        More from NIAT Insider
      </h2>
      <nav aria-label="Related articles">
        <ul className="divide-y divide-[rgba(30,41,59,0.08)] list-none p-0 m-0">
          {articles.map((related) => {
            const href = hrefForArticle(related, mode, campusSlug, apiCampuses);
            return (
              <li key={related.id}>
                <Link
                  href={href}
                  className="group flex gap-4 py-4 border-l-[3px] border-l-transparent pl-3 transition-all duration-150 ease-out hover:border-l-[#991b1b]"
                >
                  {related.cover_image ? (
                    <div className="w-24 h-24 md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden hidden sm:block bg-[rgba(30,41,59,0.06)]">
                      {/* eslint-disable-next-line @next/next/no-img-element -- server-only crawlable markup */}
                      <img
                        src={related.cover_image}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
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
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6 text-center">
        <Link href={footerHref} className="inline-flex items-center gap-1 text-[#991b1b] font-medium text-sm hover:underline">
          {footerLabel}
        </Link>
      </div>
    </section>
  );
}
