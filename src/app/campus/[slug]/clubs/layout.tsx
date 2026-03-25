import type { Metadata } from 'next'
interface Props { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/campuses/${slug}/`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) throw new Error()
    const campus = await res.json()
    return {
      title: `Clubs at ${campus.name}`,
      description: `Explore all student clubs and communities at ${campus.name}.`,
      alternates: { canonical: `/campus/${slug}/clubs` },
    }
  } catch {
    return { title: 'Campus Clubs — NIAT Insider' }
  }
}
export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
