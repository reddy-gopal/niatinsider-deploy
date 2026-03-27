import type { Metadata } from 'next'
import { API_BASE } from '../../../../../lib/apiBase'
interface Props { params: Promise<{ slug: string; clubId: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, clubId } = await params
  try {
    const res = await fetch(
      `${API_BASE}/api/clubs/${clubId}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const club = await res.json()
    return {
      title: `${club.name} — Club at NIAT`,
      description: club.about || `Learn about ${club.name} at NIAT.`,
      alternates: { canonical: `/campus/${slug}/clubs/${clubId}` },
      openGraph: {
        title: `${club.name} — Club at NIAT`,
        description: club.about || `Learn about ${club.name} at NIAT.`,
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
