import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'NIAT Articles & Admission Reviews | NIAT Insider',
  description: 'Browse hundreds of student-written articles covering NIAT admission tips, placement history, campus life, tech clubs, and unbiased hostel reviews for every NIAT campus.',
  keywords: ['niat articles', 'niat placement reviews', 'niat campus life guide', 'niat admissions', 'niat student life'],
  openGraph: {
    title: 'NIAT Articles & Admission Reviews | NIAT Insider',
    description: 'Browse hundreds of student-written articles covering NIAT admission tips, placement history, campus life, tech clubs, and unbiased hostel reviews for every NIAT campus.',
    url: 'https://www.niatinsider.com/articles',
    type: 'website',
  },
}

export default function ArticlesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
