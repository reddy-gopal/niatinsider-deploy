import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How-To Guides',
  description: 'Practical guides for every NIAT student.',
  openGraph: {
    title: 'How-To Guides',
    description: 'Practical guides for every NIAT student.',
    url: 'https://www.niatinsider.com/how-to-guides',
    type: 'website',
  },
}

export default function HowToGuidesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
