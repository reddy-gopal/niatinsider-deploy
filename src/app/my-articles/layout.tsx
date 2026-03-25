import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Articles',
  description: 'View and manage your published articles.',
}

export default function MyArticlesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
