import { cookies } from 'next/headers';

/**
 * For Server Components calling the Django API: forward the browser Cookie header so
 * httpOnly JWT cookies reach the backend (credentials: 'include' alone does not do this in Node fetch).
 */
export async function serverCookieHeader(): Promise<string | undefined> {
  const store = await cookies();
  const parts = store.getAll().map((c) => `${c.name}=${c.value}`);
  return parts.length > 0 ? parts.join('; ') : undefined;
}
