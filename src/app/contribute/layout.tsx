import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'Share your knowledge with NIAT students.',
}

export default function ContributeLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
