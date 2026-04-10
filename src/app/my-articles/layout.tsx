import type { Metadata } from 'next'
import RequireOnboarding from '@/components/RequireOnboarding'
import RequireSessionServer from '@/components/RequireSessionServer'

export const metadata: Metadata = {
  title: 'My Articles',
  description: 'View and manage your published articles.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MyArticlesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <RequireSessionServer fallbackFrom="/my-articles">
      <RequireOnboarding>
        {children}
      </RequireOnboarding>
    </RequireSessionServer>
  )
}
