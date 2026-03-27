import type { Metadata } from 'next'
import { API_BASE } from '../../../../lib/apiBase'
interface Props { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(
      `${API_BASE}/api/campuses/${slug}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const campus = await res.json()
    return {
      title: `Clubs at ${campus.name}`,
      description: `Explore all student clubs and communities at ${campus.name}.`,
      alternates: { canonical: `/campus/${slug}/clubs` },
      openGraph: {
        title: `Clubs at ${campus.name}`,
        description: `Explore all student clubs and communities at ${campus.name}.`,
        url: `/campus/${slug}/clubs`,
        type: 'website',
      },
    }
  } catch {
    return {
      title: `${slug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
      description: `Explore student clubs and communities in ${slug.replace(/-/g, ' ')} campus.`,
      alternates: { canonical: `/campus/${slug}/clubs` },
      openGraph: {
        title: `${slug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
        description: `Explore student clubs and communities in ${slug.replace(/-/g, ' ')} campus.`,
        url: `/campus/${slug}/clubs`,
        type: 'website',
      },
    }
  }
}
export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
