import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How-To Guides',
  description: 'Practical guides for every NIAT student.',
}

export default function HowToGuidesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
