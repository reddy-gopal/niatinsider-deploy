import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.niatinsider.com'
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

type CampusApi = {
  id?: string
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
  let campusClubRoutes: MetadataRoute.Sitemap = []
  let articleRoutes: MetadataRoute.Sitemap = []
  let clubDetailRoutes: MetadataRoute.Sitemap = []
  const campusIdToSlug = new Map<string, string>()

  try {
    const campusRes = await fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 }
    })
    if (campusRes.ok) {
      const data = await campusRes.json()
      const campuses: CampusApi[] = data.results ?? data
      campuses.forEach((c) => {
        if (c.id != null) campusIdToSlug.set(String(c.id), c.slug)
      })
      campusRoutes = campuses.map((c) => ({
        url: `${BASE_URL}/campus/${c.slug}`,
        lastModified: safeDate(c.updated_at),
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      }))
      campusClubRoutes = campuses.map((c) => ({
        url: `${BASE_URL}/campus/${c.slug}/clubs`,
        lastModified: safeDate(c.updated_at),
        priority: 0.75,
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
      const articleRes: Response = await fetch(nextUrl, { next: { revalidate: 3600 } })
      if (!articleRes.ok) break
      const data: { results?: ArticleApi[]; next?: string | null } | ArticleApi[] = await articleRes.json()
      const batch: ArticleApi[] = Array.isArray(data) ? data : (data.results ?? [])
      articles.push(...batch)
      nextUrl = !Array.isArray(data) && typeof data.next === 'string' && data.next.length > 0 ? data.next : null
    }
    articleRoutes = articles
      .filter((a) => Boolean(a.slug))
      .map((a) => {
        const isGlobal = a.is_global_guide || !a.campus_id || !a.campus_slug
        return {
          url: isGlobal
            ? `${BASE_URL}/article/${a.slug}`
            : `${BASE_URL}/campus/${a.campus_slug}/article/${a.slug}`,
          lastModified: safeDate(a.updated_at),
          priority: 0.8,
          changeFrequency: 'monthly' as const,
        }
      })
  } catch {
    // API unavailable at build time — skip dynamic article routes
  }

  try {
    const clubs: ClubsApi[] = []
    let nextUrl: string | null = `${API_BASE}/api/clubs/?page_size=100`
    while (nextUrl) {
      const clubsRes: Response = await fetch(nextUrl, { next: { revalidate: 3600 } })
      if (!clubsRes.ok) break
      const data: { results?: ClubsApi[]; next?: string | null } | ClubsApi[] = await clubsRes.json()
      const batch: ClubsApi[] = Array.isArray(data) ? data : (data.results ?? [])
      clubs.push(...batch)
      nextUrl = !Array.isArray(data) && typeof data.next === 'string' && data.next.length > 0 ? data.next : null
    }

    clubDetailRoutes = clubs.reduce<MetadataRoute.Sitemap>((acc, club) => {
      if (!club.slug || !club.campus_id) return acc
      const campusSlug = campusIdToSlug.get(String(club.campus_id))
      if (!campusSlug) return acc
      acc.push({
        url: `${BASE_URL}/campus/${campusSlug}/clubs/${club.slug}`,
        lastModified: safeDate(club.updated_at),
        priority: 0.7,
        changeFrequency: 'weekly',
      })
      return acc
    }, [])
  } catch {
    // API unavailable at build time — skip dynamic clubs routes
  }

  return [
    ...staticRoutes,
    ...campusRoutes,
    ...campusClubRoutes,
    ...clubDetailRoutes,
    ...articleRoutes,
  ]
}
