import type { MetadataRoute } from 'next'
import { API_BASE } from '../lib/apiBase'

const BASE_URL = 'https://www.niatinsider.com'

type CampusApi = {
  id?: string | number
  slug: string
  updated_at?: string
}

type ArticleApi = {
  slug?: string
  updated_at?: string
  campus_id?: string | null
  campus_slug?: string | null
  is_global_guide?: boolean
}

type ClubsApi = {
  id?: string
  slug?: string
  campus_id?: string | null
  updated_at?: string
}

const safeDate = (value?: string) => (value ? new Date(value) : new Date())

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${BASE_URL}/campuses`, priority: 0.9, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${BASE_URL}/articles`, priority: 0.85, changeFrequency: 'daily', lastModified: new Date() },
    { url: `${BASE_URL}/how-to-guides`, priority: 0.8, changeFrequency: 'weekly', lastModified: new Date() },
    { url: `${BASE_URL}/guide`, priority: 0.7, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE_URL}/about`, priority: 0.6, changeFrequency: 'monthly', lastModified: new Date() },
    { url: `${BASE_URL}/contribute`, priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
  ]

  let campusRoutes: MetadataRoute.Sitemap = []
  let articleRoutes: MetadataRoute.Sitemap = []
  const campusSlugById = new Map<string, string>()

  try {
    const campusRes = await fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 },
      credentials: 'include',
    })
    if (campusRes.ok) {
      const data = await campusRes.json()
      const campuses: CampusApi[] = data.results ?? data
      campuses.forEach((c) => {
        if (c.id != null && c.slug) campusSlugById.set(String(c.id), c.slug)
      })
      campusRoutes = campuses.map((c) => ({
        url: `${BASE_URL}/${c.slug}`,
        lastModified: safeDate(c.updated_at),
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      }))
    }
  } catch {
    // API unavailable at build time — skip dynamic campus routes
  }

  try {
    const articles: ArticleApi[] = []
    let nextUrl: string | null = `${API_BASE}/api/articles/articles/?status=published&page_size=100`
    while (nextUrl) {
      const articleRes: Response = await fetch(nextUrl, { next: { revalidate: 3600 }, credentials: 'include' })
      if (!articleRes.ok) break
      const data: { results?: ArticleApi[]; next?: string | null } | ArticleApi[] = await articleRes.json()
      const batch: ArticleApi[] = Array.isArray(data) ? data : (data.results ?? [])
      articles.push(...batch)
      nextUrl = !Array.isArray(data) && typeof data.next === 'string' && data.next.length > 0 ? data.next : null
    }
    articleRoutes = articles
      .filter((a) => Boolean(a.slug))
      .map((a) => {
        const campusSlug =
          (a.campus_slug ?? '').trim() ||
          (a.campus_id != null ? campusSlugById.get(String(a.campus_id)) : '')
        const isGlobal = a.is_global_guide === true && !campusSlug
        if (!isGlobal && !campusSlug) return null
        return {
          url: isGlobal
            ? `${BASE_URL}/article/${a.slug}`
            : `${BASE_URL}/${campusSlug}/article/${a.slug}`,
          lastModified: safeDate(a.updated_at),
          priority: 0.8,
          changeFrequency: 'monthly' as const,
        }
      })
      .filter((route): route is NonNullable<typeof route> => route !== null)
  } catch {
    // API unavailable at build time — skip dynamic article routes
  }

  return [
    ...staticRoutes,
    ...campusRoutes,
    ...articleRoutes,
  ]
}
