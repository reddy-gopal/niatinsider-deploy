import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create your NIAT Insider account.',
}

export default function RegisterLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
