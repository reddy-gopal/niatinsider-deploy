import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NIAT Insider | The Ultimate Student Guide for NIAT',
  description: 'Learn about NIAT Insider. We are the premier platform for students to share genuine reviews, hostel details, clubs, and placement guides across all NIAT campuses.',
  keywords: ['about niat', 'about niat insider', 'what is niat', 'niat university details'],
}

export default function AboutLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
