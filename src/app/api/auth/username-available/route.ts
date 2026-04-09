import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: 'No token' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') ?? '';
  const res = await fetch(
    `${API_BASE}/api/auth/username-available/?username=${encodeURIComponent(username)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
