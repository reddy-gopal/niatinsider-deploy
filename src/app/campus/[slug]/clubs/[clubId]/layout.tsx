import type { Metadata } from 'next'
interface Props { params: Promise<{ slug: string; clubId: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, clubId } = await params
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/clubs/${clubId}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const club = await res.json()
    return {
      title: `${club.name} — Club at NIAT`,
      description: club.about || `Learn about ${club.name} at NIAT.`,
      alternates: { canonical: `/campus/${slug}/clubs/${clubId}` },
    }
  } catch {
    return { title: 'Club — NIAT Insider' }
  }
}
export default function ClubDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
