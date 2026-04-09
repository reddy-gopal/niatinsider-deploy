'use client'

interface CampusSchemaProps {
  name: string
  description?: string
  location: string
  state: string
  slug: string
  imageUrl?: string
}

const BASE_URL = 'https://www.niatinsider.com'

export function CampusStructuredData({
  name,
  description,
  location,
  state,
  slug,
  imageUrl,
}: CampusSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: name,
    description: description ?? undefined,
    url: `${BASE_URL}/${slug}`,
    image: imageUrl ?? undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: location,
      addressRegion: state,
      addressCountry: 'IN',
    },
    sameAs: `${BASE_URL}/${slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
