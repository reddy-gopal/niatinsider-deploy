import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Lightweight session hint for the client: HttpOnly refresh_token cannot be read
 * from JavaScript, so ensureRefreshed() uses this route to avoid POSTing refresh
 * when no refresh cookie exists.
 */
export async function GET() {
  const store = await cookies();
  const hasRefreshToken = Boolean(store.get('refresh_token')?.value?.trim());
  return NextResponse.json({ hasRefreshToken });
}
