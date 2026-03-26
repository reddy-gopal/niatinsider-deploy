import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NIAT Insider',
    short_name: 'NIAT Insider',
    description:
      'Student-written guides for every NIAT campus. Onboarding, food, clubs, placements and more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#991b1b',
    lang: 'en-IN',
    icons: [
      {
        src: '/niat.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
