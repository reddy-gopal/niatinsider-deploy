import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles and campuses on NIAT Insider.',
}

export default function SearchLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
