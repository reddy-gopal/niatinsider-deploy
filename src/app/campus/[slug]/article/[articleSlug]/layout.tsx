import type { Metadata } from 'next'
interface Props { params: Promise<{ slug: string; articleSlug: string }> }
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, articleSlug } = await params
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/articles/articles/${articleSlug}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const article = await res.json()

    const title = article.meta_title?.trim() || article.title?.trim() || 'NIAT Insider'

    // Fallback description reading raw body text
    const rawBody = (article.body || '').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim()
    const description = article.meta_description?.trim() || article.excerpt?.trim() || (rawBody.length > 0 ? `${rawBody.substring(0, 155)}...` : 'Read this authentic student-written NIAT Insider article.')

    const image = article.cover_image || undefined

    // Dynamically fallback keywords if left empty by writer
    let keywords = article.meta_keywords || []
    if (keywords.length === 0) {
      keywords = [
        'NIAT Insider',
        article.campus_name,
        article.category,
        article.subcategory,
        article.title,
        'student guide'
      ].filter(Boolean)
    }

    return {
      title: { absolute: title },
      description,
      keywords,
      alternates: { canonical: `/campus/${slug}/article/${article.slug}` },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: `/campus/${slug}/article/${article.slug}`,
        type: 'article',
        publishedTime: article.published_at,
        authors: [article.author_username],
        images: image ? [{ url: image }] : [],
      },
      twitter: {
        card: image ? 'summary_large_image' : 'summary',
        title,
        description,
        images: image ? [image] : undefined,
      },
    }
  } catch {
    return {
      title: 'Campus Article — NIAT Insider',
      description: `Read this student article from ${slug} campus on NIAT Insider.`,
    }
  }
}
export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
