import type { Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/campuses/${slug}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error('not found')
    const campus = await res.json()
    return {
      title: `${campus.name} — Student Guide`,
      description: campus.description?.trim()
        ? campus.description.slice(0, 155)
        : `Explore student guides, clubs and campus life at ${campus.name}.`,
      alternates: { canonical: `/campus/${slug}` },
      openGraph: {
        title: `${campus.name} — Student Guide | NIAT Insider`,
        description: campus.description?.trim()
          ? campus.description.slice(0, 155)
          : `Explore student guides, clubs and campus life at ${campus.name}.`,
        images: campus.image_url ? [{ url: campus.image_url }] : [],
        type: 'website',
      },
    }
  } catch {
    return {
      title: 'Campus — NIAT Insider',
      description: 'Explore student guides and campus life at NIAT.',
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
