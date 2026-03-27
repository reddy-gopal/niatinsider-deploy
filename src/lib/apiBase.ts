const envApiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!envApiBase) {
  throw new Error('NEXT_PUBLIC_API_BASE_URL is required');
}

export const API_BASE = envApiBase.replace(/\/$/, '');
