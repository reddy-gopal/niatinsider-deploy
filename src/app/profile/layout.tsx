import type { Metadata } from 'next'
import RequireOnboarding from '@/components/RequireOnboarding'

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your NIAT Insider profile.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ProfileLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <RequireOnboarding>{children}</RequireOnboarding>
}
