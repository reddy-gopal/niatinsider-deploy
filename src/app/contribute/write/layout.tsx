import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Write Article',
  description: 'Write and publish an article on NIAT Insider.',
}

export default function WriteLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
