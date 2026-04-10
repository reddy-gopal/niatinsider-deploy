import type { Metadata } from 'next'
import RequireSessionServer from '@/components/RequireSessionServer'

export const metadata: Metadata = {
  title: 'Onboarding',
  description: 'Set up your NIAT Insider profile.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OnboardingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <RequireSessionServer fallbackFrom="/onboarding">{children}</RequireSessionServer>
}
