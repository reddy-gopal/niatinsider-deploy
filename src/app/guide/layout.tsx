import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Guide',
  description: 'Your complete guide to life at NIAT.',
  openGraph: {
    title: 'Student Guide',
    description: 'Your complete guide to life at NIAT.',
    url: 'https://www.niatinsider.com/guide',
    type: 'website',
  },
}

export default function GuideLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
