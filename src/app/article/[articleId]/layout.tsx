import type { Metadata } from 'next'

interface Props { params: Promise<{ articleId: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { articleId } = await params
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/articles/${articleId}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const article = await res.json()
    return {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      keywords: article.meta_keywords ?? [],
      alternates: { canonical: `/article/${articleId}` },
      openGraph: {
        title: article.meta_title || article.title,
        description: article.meta_description || article.excerpt,
        type: 'article',
        publishedTime: article.published_at,
        authors: [article.author_username],
        images: article.cover_image ? [article.cover_image] : [],
      },
    }
  } catch {
    return { title: 'Article — NIAT Insider' }
  }
}

export default function ArticleLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
