/**
 * Canonical public origin for NIAT Insider (OG, LinkedIn share, canonicals).
 * Set NEXT_PUBLIC_SITE_URL in env for staging; production defaults to www.
 */
export const PUBLIC_SITE_URL ='https://www.niatinsider.com'

/** Public badge page URL on the Next app (never use API_BASE / localhost for social share). */
export function publicBadgePageUrl(username: string): string {
  return `${PUBLIC_SITE_URL}/badge/${encodeURIComponent(username)}`;
}
