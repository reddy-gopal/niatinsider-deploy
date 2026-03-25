import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore NIAT Campuses',
  description: 'Browse all NIAT campuses and find student guides, clubs, and local tips for every location.',
}

export default function CampusesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
