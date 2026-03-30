import type { Metadata } from 'next'
import { API_BASE } from '../../../../../lib/apiBase'
interface Props { params: Promise<{ slug: string; clubId: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, clubId } = await params
  const campusRes = await fetch(`${API_BASE}/api/campuses/${slug}/`, { next: { revalidate: 3600 } })
  const campus = campusRes.ok ? await campusRes.json() : null
  const campusId = campus?.id
  try {
    const res = await fetch(
      `${API_BASE}/api/articles/clubs/${clubId}/${campusId ? `?campus=${campusId}` : ''}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const club = await res.json()
    const description = club.chapter_description || club.objective || club.about || `Learn about ${club.name} at NIAT.`
    return {
      title: `${club.name} — Club at NIAT`,
      description,
      alternates: { canonical: `/campus/${slug}/clubs/${clubId}` },
      openGraph: {
        title: `${club.name} — Club at NIAT`,
        description,
        url: `/campus/${slug}/clubs/${clubId}`,
        type: 'website',
      },
    }
  } catch {
    return {
      title: `Club at ${slug.replace(/-/g, ' ')} — NIAT Insider`,
      description: `Discover this student club at ${slug.replace(/-/g, ' ')} campus on NIAT Insider.`,
      openGraph: {
        title: `Club at ${slug.replace(/-/g, ' ')} — NIAT Insider`,
        description: `Discover this student club at ${slug.replace(/-/g, ' ')} campus on NIAT Insider.`,
        url: `/campus/${slug}/clubs/${clubId}`,
        type: 'website',
      },
    }
  }
}
export default function ClubDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
