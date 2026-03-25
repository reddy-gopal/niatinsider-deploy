import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about NIAT Insider and our mission.',
}

export default function AboutLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
