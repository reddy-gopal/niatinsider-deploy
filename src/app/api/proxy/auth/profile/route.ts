import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

export async function PATCH(req: Request) {
  const access = (await cookies()).get('access_token')?.value;
  if (!access) return NextResponse.json({ detail: 'Unauthorized' }, { status: 401 });

  const contentType = req.headers.get('content-type') ?? '';
  const isForm = contentType.includes('multipart/form-data');

  const upstream = await fetch(`${API_BASE}/api/auth/me/profile/`, {
    method: 'PATCH',
    headers: isForm
      ? { Authorization: `Bearer ${access}` }
      : { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    body: isForm ? await req.formData() : JSON.stringify(await req.json()),
    cache: 'no-store',
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
}
