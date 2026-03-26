import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your NIAT Insider account.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function RegisterLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
