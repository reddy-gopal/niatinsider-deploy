export function extractDjangoError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Something went wrong. Please try again.';
  }

  const d = data as Record<string, unknown>;

  if (typeof d.detail === 'string' && d.detail.trim()) return d.detail.trim();
  if (typeof d.error === 'string' && d.error.trim()) return d.error.trim();

  if (Array.isArray(d.non_field_errors) && d.non_field_errors.length > 0) {
    return String(d.non_field_errors[0]);
  }

  for (const key of Object.keys(d)) {
    const val = d[key];
    if (Array.isArray(val) && val.length > 0) {
      const msg = String(val[0]);
      return msg.charAt(0).toUpperCase() + msg.slice(1);
    }
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }

  return 'Something went wrong. Please try again.';
}
