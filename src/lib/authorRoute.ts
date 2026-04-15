export function getAuthorProfileHref(authorIdentifier: string | null | undefined): string {
  const trimmed = (authorIdentifier ?? '').trim();
  const safeValue = trimmed || 'unknown';

  try {
    return `/author/${encodeURIComponent(decodeURIComponent(safeValue))}`;
  } catch {
    return `/author/${encodeURIComponent(safeValue)}`;
  }
}
