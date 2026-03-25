import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Guide',
  description: 'Your complete guide to life at NIAT.',
}

export default function GuideLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
