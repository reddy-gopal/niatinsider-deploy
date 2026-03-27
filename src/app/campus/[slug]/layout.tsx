import type { Metadata } from 'next'

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://www.niatinsider.com'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(
      `${apiBase}/api/campuses/${slug}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('not found')
    const campus = await res.json()
    const description = campus.description?.trim()
      ? campus.description.slice(0, 155)
      : `Explore student guides, clubs and campus life at ${campus.name}.`

    return {
      title: `${campus.name} — Student Guide`,
      description,
      alternates: { canonical: `/campus/${slug}` },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: `${campus.name} — Student Guide | NIAT Insider`,
        description,
        url: `/campus/${slug}`,
        images: campus.image_url ? [{ url: campus.image_url }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${campus.name} — Student Guide`,
        description,
        images: campus.image_url ? [campus.image_url] : undefined,
      },
    }
  } catch {
    return {
      title: `${slug.replace(/-/g, ' ')} Campus — NIAT Insider`,
      description: `Explore student guides, clubs and campus life for ${slug.replace(/-/g, ' ')} on NIAT Insider.`,
      alternates: { canonical: `/campus/${slug}` },
      openGraph: {
        title: `${slug.replace(/-/g, ' ')} Campus — NIAT Insider`,
        description: `Explore student guides, clubs and campus life for ${slug.replace(/-/g, ' ')} on NIAT Insider.`,
        url: `/campus/${slug}`,
        type: 'website',
      },
    }
  }
}

export default function CampusLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
