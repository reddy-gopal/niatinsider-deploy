/**
 * Sanitizes a single media URL.
 * Encodes spaces and special characters in the path segment only.
 * Safe to call multiple times and avoids double-encoding.
 */
export function sanitizeMediaUrl(url: unknown): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return '';
  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitizes an array of media URLs and drops invalid entries.
 */
export function sanitizeMediaUrls(urls: unknown[] = []): string[] {
  if (!Array.isArray(urls)) return [];
  return urls.map(sanitizeMediaUrl).filter(Boolean);
}
