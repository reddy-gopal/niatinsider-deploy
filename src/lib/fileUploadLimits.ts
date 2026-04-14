/** Matches common Django / DRF image field limits for ID card & profile uploads. */
export const MAX_PROFILE_UPLOAD_FILE_BYTES = 10 * 1024 * 1024;

export const FILE_SIZE_HINT_ID_CARD =
  'Maximum file size: 10MB. Accepted formats: JPG, PNG, PDF.';

export const FILE_SIZE_HINT_PROFILE_IMAGE =
  'Maximum file size: 10MB. Accepted formats: JPG, PNG, and other common image types.';

export const FILE_SIZE_HINT_ARTICLE_EMBED_IMAGE =
  'Maximum file size: 10MB. Accepted formats: JPG, PNG, GIF, WebP.';

export const FILE_TOO_LARGE_MESSAGE =
  'File size must be 10MB or less. Please choose a smaller file.';

export function assertFileUnderMaxBytes(file: File, maxBytes: number): string | null {
  if (file.size > maxBytes) return FILE_TOO_LARGE_MESSAGE;
  return null;
}
