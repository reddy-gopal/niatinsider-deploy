import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/onboarding',
          '/profile',
          '/my-articles',
          '/search',
        ],
      },
    ],
    sitemap: 'https://www.niatinsider.com/sitemap.xml',
    host: 'https://www.niatinsider.com',
  }
}
