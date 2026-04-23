/**
 * Author profile routing
 *
 * Primary route:  /author/<profile_slug>
 * Fallback route: /author/<username>  (legacy - same page handles both)
 *
 * The [authorSlug] page tries the slug endpoint first, then falls back
 * to the username endpoint. This means old username-based URLs continue
 * to work without any redirects.
 */
export const getAuthorProfileHref = (slug: string): string =>
  `/author/${encodeURIComponent(slug)}`;

// Legacy: username-based (kept for contexts where profile_slug
// is not yet returned by the API)
export const getAuthorProfileHrefByUsername = (username: string): string =>
  `/author/${encodeURIComponent(username)}`;
