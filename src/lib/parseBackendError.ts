/**
 * Turns API error payloads (including stringified Python ErrorDetail) into a short user-facing string.
 */
export function parseBackendError(error: unknown): string {
  try {
    const axiosErr = error as {
      response?: { data?: unknown };
      message?: string;
    };
    const data = axiosErr?.response?.data;

    if (data && typeof data === 'object') {
      const d = data as Record<string, unknown>;

      const nested = d.error;
      if (nested && typeof nested === 'object') {
        const msg = (nested as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim()) {
          const cleaned = extractFromErrorDetailString(msg);
          if (cleaned) return cleaned;
        }
      }

      if (typeof d.detail === 'string' && d.detail.trim()) return d.detail.trim();
      if (Array.isArray(d.detail) && d.detail.length > 0) {
        const first = d.detail[0];
        if (typeof first === 'string') return first;
      }
      if (typeof d.message === 'string' && d.message.trim()) {
        const cleaned = extractFromErrorDetailString(d.message);
        return cleaned || d.message.trim();
      }
    }

    const top = axiosErr?.message;
    if (typeof top === 'string' && top.trim()) {
      const cleaned = extractFromErrorDetailString(top);
      return cleaned || top.trim();
    }
  } catch {
    // fall through
  }
  return 'Something went wrong. Please try again.';
}

function extractFromErrorDetailString(raw: string): string {
  const trimmed = raw.trim();
  const m1 = trimmed.match(/string='([^']*)'/);
  if (m1?.[1]) return m1[1];
  const m2 = trimmed.match(/string="([^"]*)"/);
  if (m2?.[1]) return m2[1];
  return '';
}
