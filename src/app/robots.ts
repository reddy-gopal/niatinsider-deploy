import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/contribute/write',
          '/profile',
          '/my-articles',
          '/onboarding',
        ],
      },
    ],
    sitemap: 'https://niatinsider.com/sitemap.xml',
  }
}
