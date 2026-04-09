import type { Metadata } from 'next'
import { API_BASE } from '@/lib/apiBase'

interface Props { params: Promise<{ campusSlug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campusSlug } = await params
  try {
    const res = await fetch(
      `${API_BASE}/api/campuses/${campusSlug}/`,
      { next: { revalidate: 3600 }, credentials: 'include' }
    )
    if (!res.ok) throw new Error()
    const campus = await res.json()
    return {
      title: `Clubs at ${campus.name}`,
      description: `Explore all student clubs and communities at ${campus.name}.`,
      alternates: { canonical: `/${campusSlug}/clubs` },
      openGraph: {
        title: `Clubs at ${campus.name}`,
        description: `Explore all student clubs and communities at ${campus.name}.`,
        url: `/${campusSlug}/clubs`,
        type: 'website',
      },
    }
  } catch {
    return {
      title: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
      description: `Explore student clubs and communities in ${campusSlug.replace(/-/g, ' ')} campus.`,
      alternates: { canonical: `/${campusSlug}/clubs` },
      openGraph: {
        title: `${campusSlug.replace(/-/g, ' ')} Clubs — NIAT Insider`,
        description: `Explore student clubs and communities in ${campusSlug.replace(/-/g, ' ')} campus.`,
        url: `/${campusSlug}/clubs`,
        type: 'website',
      },
    }
  }
}

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
