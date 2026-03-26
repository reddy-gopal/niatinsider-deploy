import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search articles and campuses on NIAT Insider.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SearchLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
