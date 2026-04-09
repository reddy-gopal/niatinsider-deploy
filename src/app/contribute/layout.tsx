import type { Metadata } from 'next'
import RequireOnboarding from '@/components/RequireOnboarding'

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'Share your knowledge with NIAT students.',
  openGraph: {
    title: 'Contribute',
    description: 'Share your knowledge with NIAT students.',
    url: 'https://www.niatinsider.com/contribute',
    type: 'website',
  },
}

export default function ContributeLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <RequireOnboarding>{children}</RequireOnboarding>
}
