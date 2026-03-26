'use client'

interface ArticleSchemaProps {
  title: string
  description: string
  authorUsername: string
  publishedAt: string | null
  coverImage?: string
  slug: string
  isGlobalRoute?: boolean
}

const BASE_URL = 'https://www.niatinsider.com'

export function ArticleStructuredData({
  title,
  description,
  authorUsername,
  publishedAt,
  coverImage,
  slug,
  isGlobalRoute = false,
}: ArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: authorUsername,
    },
    publisher: {
      '@type': 'Organization',
      name: 'NIAT Insider',
      url: BASE_URL,
    },
    datePublished: publishedAt ?? undefined,
    image: coverImage ?? undefined,
    url: isGlobalRoute
      ? `${BASE_URL}/article/${slug}`
      : `${BASE_URL}/articles/${slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': isGlobalRoute
        ? `${BASE_URL}/article/${slug}`
        : `${BASE_URL}/articles/${slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
