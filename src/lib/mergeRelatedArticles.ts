import type { ApiArticle } from '@/types/articleApi';

/** Pick up to `limit` related slugs: same-category (or campus) pool first, then latest fallback. */
export function mergeRelatedArticles(
  currentSlug: string,
  primary: ApiArticle[],
  latest: ApiArticle[],
  limit = 3
): ApiArticle[] {
  const seen = new Set<string>([currentSlug]);
  const merged: ApiArticle[] = [];
  for (const item of primary) {
    if (!item?.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    merged.push(item);
    if (merged.length >= limit) return merged;
  }
  for (const item of latest) {
    if (!item?.slug || seen.has(item.slug)) continue;
    seen.add(item.slug);
    merged.push(item);
    if (merged.length >= limit) break;
  }
  return merged;
}
