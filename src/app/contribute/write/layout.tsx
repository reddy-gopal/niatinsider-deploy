import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Write for NIAT Insider | Publish Your Student Guide',
  description: 'Write an article on NIAT Insider to share your authentic NIAT campus experience, club insights, admission tips, or placement guides with thousands of future NIAT students.',
  keywords: ['write for niat', 'niat contributor', 'share niat experience', 'niat students', 'publish niat guide', 'niat placements guide'],
}

export default function WriteLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
