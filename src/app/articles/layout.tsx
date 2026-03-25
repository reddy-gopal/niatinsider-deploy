import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse all student-written articles across every NIAT campus.',
}

export default function ArticlesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
