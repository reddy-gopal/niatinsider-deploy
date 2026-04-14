import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function POST(req: NextRequest) {
  const token = (await cookies()).get('access_token')?.value;
  if (!token) {
    return NextResponse.json({ detail: 'No token' }, { status: 401 });
  }

  const body = await req.json();
  const res = await fetch(`${API_BASE}/api/articles/presigned-upload-url/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
