import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value

  // Unauthenticated users are allowed.
  if (!token) {
    return NextResponse.next()
  }

  // Enforce onboarding only for freshly registered users.
  const needsOnboarding = request.cookies.get('niat_needs_onboarding')?.value === 'true'
  if (!needsOnboarding) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/onboarding/role'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    '/',
    '/campuses',
    '/campus/:path*',
    '/articles',
    '/articles/:path*',
    '/article/:path*',
    '/search',
    '/how-to-guides',
    '/guide',
    '/contribute',
    '/contribute/:path*',
    '/profile',
    '/my-articles',
    '/about',
  ],
}
