import type { MetadataRoute } from 'next'

const BASE_URL = 'https://niatinsider.com'
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, priority: 1.0, changeFrequency: 'daily' },
    { url: `${BASE_URL}/campuses`, priority: 0.9, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/how-to-guides`, priority: 0.8, changeFrequency: 'weekly' },
    { url: `${BASE_URL}/articles`, priority: 0.8, changeFrequency: 'daily' },
    { url: `${BASE_URL}/guide`, priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/about`, priority: 0.5, changeFrequency: 'monthly' },
  ]

  let campusRoutes: MetadataRoute.Sitemap = []
  let articleRoutes: MetadataRoute.Sitemap = []

  try {
    const campusRes = await fetch(`${API_BASE}/api/campuses/`, {
      next: { revalidate: 86400 }
    })
    if (campusRes.ok) {
      const data = await campusRes.json()
      const campuses = data.results ?? data
      campusRoutes = campuses.map((c: { slug: string; updated_at?: string }) => ({
        url: `${BASE_URL}/campus/${c.slug}`,
        lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
        priority: 0.9,
        changeFrequency: 'weekly' as const,
      }))
    }
  } catch {
    // API unavailable at build time — skip dynamic campus routes
  }

  try {
    const articleRes = await fetch(
      `${API_BASE}/api/articles/?status=published&page_size=500`,
      { next: { revalidate: 3600 } }
    )
    if (articleRes.ok) {
      const data = await articleRes.json()
      const articles = data.results ?? data
      articleRoutes = articles.map((a: {
        slug: string
        updated_at?: string
        campus_id?: string | null
        is_global_guide?: boolean
      }) => ({
        url: a.is_global_guide || !a.campus_id
          ? `${BASE_URL}/article/${a.slug}`
          : `${BASE_URL}/articles/${a.slug}`,
        lastModified: a.updated_at ? new Date(a.updated_at) : new Date(),
        priority: 0.8,
        changeFrequency: 'monthly' as const,
      }))
    }
  } catch {
    // API unavailable at build time — skip dynamic article routes
  }

  return [...staticRoutes, ...campusRoutes, ...articleRoutes]
}
