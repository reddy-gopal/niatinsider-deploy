import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore All NIAT Campuses | NIAT Insider',
  description: 'Compare and browse all NIAT campuses. Discover exclusive student guides, tech clubs, local city tips, and campus details for every NIAT university location.',
  keywords: ['niat campuses', 'best niat campus', 'niat locations', 'niat campus list', 'niat reviews'],
  openGraph: {
    title: 'Explore All NIAT Campuses | NIAT Insider',
    description: 'Compare and browse all NIAT campuses. Discover exclusive student guides, tech clubs, local city tips, and campus details for every NIAT university location.',
    url: 'https://www.niatinsider.com/campuses',
    type: 'website',
  },
}

export default function CampusesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
