import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({} as { secret?: string; path?: string; paths?: unknown[] }));
  const secret = body?.secret;
  const singlePath = body?.path;
  const multiPaths = Array.isArray(body?.paths) ? body.paths : [];

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  const normalizedPaths = [
    ...(typeof singlePath === 'string' ? [singlePath] : []),
    ...multiPaths.filter((p: unknown): p is string => typeof p === 'string' && p.length > 0),
  ];

  if (normalizedPaths.length === 0) {
    return NextResponse.json({ message: 'Path is required' }, { status: 400 });
  }

  normalizedPaths.forEach((path) => revalidatePath(path));
  return NextResponse.json({ revalidated: true, paths: normalizedPaths }, { status: 200 });
}
