import type { Metadata } from 'next'
import { API_BASE } from '../../../lib/apiBase'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  cover_image: string | null
  images: Array<{ image: string }>
  status: string
  campus_name: string | null
  category: string
  subcategory: string | null
  author_username: string
  published_at: string | null
  created_at: string
  updated_at: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

const DEFAULT_FALLBACK_IMAGE = 'https://www.niatinsider.com/default-og.png'
const SITE_URL = 'https://www.niatinsider.com'

function toAbsoluteUrl(path: string): string {
  if (path.startsWith('http')) return path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

function cleanKeywords(keywords: string[] | null): string[] {
  if (!Array.isArray(keywords)) return []
  return keywords.map((k) => k.trim()).filter((k) => k.length > 0).slice(0, 15)
}

function getPrimaryImage(article: Article): string {
  if (article.cover_image) return toAbsoluteUrl(article.cover_image)
  if (Array.isArray(article.images) && article.images.length > 0 && article.images[0]?.image) {
    return toAbsoluteUrl(article.images[0].image)
  }
  return DEFAULT_FALLBACK_IMAGE
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
}

function buildDescription(article: Article): string {
  if (article.meta_description?.trim()) return article.meta_description.trim()
  if (article.excerpt?.trim()) return article.excerpt.trim()
  if (article.body) {
    const rawText = stripHtml(article.body)
    return rawText.length > 160 ? `${rawText.substring(0, 157)}...` : rawText
  }
  return 'Read the latest from NIAT Insider.'
}

const fetchArticle = async (slug: string): Promise<Article | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/articles/articles/${slug}/`, { next: { revalidate: 60 }, credentials: 'include' })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await fetchArticle(slug)

  if (!article || article.status !== 'published') {
    return {
      title: 'Article Not Found',
      description: `The article "${slug}" is unavailable on NIAT Insider.`,
      robots: { index: false, follow: false, nocache: true },
    }
  }

  const title = (article.meta_title?.trim() || article.title).trim()
  const description = buildDescription(article)
  const imageUrl = getPrimaryImage(article)
  const keywords = cleanKeywords(article.meta_keywords)
  const canonicalUrl = toAbsoluteUrl(`/article/${article.slug}`)

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
      publishedTime: article.published_at || article.created_at,
      modifiedTime: article.updated_at,
      authors: [article.author_username],
      section: article.category,
      tags: keywords.length > 0 ? keywords : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await fetchArticle(slug)

  let structuredData = null
  if (article && article.status === 'published') {
    const imageUrl = getPrimaryImage(article)
    const canonicalUrl = toAbsoluteUrl(`/article/${article.slug}`)

    structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.meta_title?.trim() || article.title,
      description: buildDescription(article),
      image: imageUrl,
      author: { '@type': 'Person', name: article.author_username },
      datePublished: article.published_at || article.created_at,
      dateModified: article.updated_at,
      mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
    }
  }

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {children}
    </>
  )
}
