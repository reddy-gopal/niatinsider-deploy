import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.niatinsider.com'
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

type CampusApi = {
  slug: string
  updated_at?: string
}

type ArticleApi = {
  id?: string
  slug?: string
  updated_at?: string
  campus_id?: string | null
  campus_slug?: string | null
  is_global_guide?: boolean
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

  try {
    const campusRes = await fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 }
    })
    if (campusRes.ok) {
      const data = await campusRes.json()
      const campuses: CampusApi[] = data.results ?? data
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
    const articleRes = await fetch(
      `${API_BASE}/api/articles/articles/?status=published&page_size=500`,
      { next: { revalidate: 3600 } }
    )
    if (articleRes.ok) {
      const data = await articleRes.json()
      const articles: ArticleApi[] = data.results ?? data
      articleRoutes = articles
        .filter((a) => Boolean(a.id))
        .map((a) => {
          const isGlobal = a.is_global_guide || !a.campus_id || !a.campus_slug
          const articleId = a.id as string

          return {
            url: isGlobal
              ? `${BASE_URL}/article/${articleId}`
              : `${BASE_URL}/campus/${a.campus_slug}/article/${articleId}`,
            lastModified: safeDate(a.updated_at),
            priority: 0.8,
            changeFrequency: 'monthly' as const,
          }
        })
    }
  } catch {
    // API unavailable at build time — skip dynamic article routes
  }

  return [
    ...staticRoutes,
    ...campusRoutes,
    ...campusClubRoutes,
    ...articleRoutes,
  ]
}
