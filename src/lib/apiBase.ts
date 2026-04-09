const rawApiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

if (!rawApiBase) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
}

export const API_BASE = rawApiBase.replace(/\/$/, '');
