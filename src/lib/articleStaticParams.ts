import { API_BASE } from '@/lib/apiBase';

type ArticleRow = {
  slug?: string;
  campus_slug?: string | null;
  campus_id?: string | null;
  is_global_guide?: boolean;
};

function nextPageUrl(data: unknown): string | null {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  const n = (data as { next?: string | null }).next;
  return typeof n === 'string' && n.length > 0 ? n : null;
}

/** Paginated published articles for SSG / sitemap-style iteration. */
async function fetchAllPublishedArticleRows(): Promise<ArticleRow[]> {
  const rows: ArticleRow[] = [];
  let nextUrl: string | null = `${API_BASE}/api/articles/articles/?status=published&page_size=100`;
  while (nextUrl) {
    const res = await fetch(nextUrl, { next: { revalidate: 3600 } });
    if (!res.ok) break;
    const data: { results?: ArticleRow[]; next?: string | null } | ArticleRow[] = await res.json();
    const batch = Array.isArray(data) ? data : (data.results ?? []);
    rows.push(...batch);
    nextUrl = nextPageUrl(data);
  }
  return rows;
}

/** `[campusSlug]/article/[articleSlug]` — campus-bound published articles only. */
export async function getCampusArticleStaticParams(): Promise<
  Array<{ campusSlug: string; articleSlug: string }>
> {
  try {
    const rows = await fetchAllPublishedArticleRows();
    const out: Array<{ campusSlug: string; articleSlug: string }> = [];
    for (const a of rows) {
      if (!a.slug) continue;
      const isGlobal = a.is_global_guide === true && (!a.campus_id || !a.campus_slug);
      if (isGlobal) continue;
      if (!a.campus_slug) continue;
      out.push({ campusSlug: String(a.campus_slug), articleSlug: String(a.slug) });
    }
    return out;
  } catch {
    return [];
  }
}

/** `/article/[slug]` — global guides / articles without campus path. */
export async function getGlobalArticleStaticParams(): Promise<Array<{ slug: string }>> {
  try {
    const rows = await fetchAllPublishedArticleRows();
    const out: Array<{ slug: string }> = [];
    for (const a of rows) {
      if (!a.slug) continue;
      const isGlobal = a.is_global_guide === true && (!a.campus_id || !a.campus_slug);
      if (!isGlobal) continue;
      out.push({ slug: String(a.slug) });
    }
    return out;
  } catch {
    return [];
  }
}
