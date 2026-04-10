import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasInsiderSessionCookiePair } from '@/lib/sessionCookie';

interface Props {
  fallbackFrom: string;
  children: React.ReactNode;
}

export default async function RequireSessionServer({ fallbackFrom, children }: Props) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!hasInsiderSessionCookiePair(accessToken, refreshToken)) {
    redirect(`/login?from=${encodeURIComponent(fallbackFrom)}`);
  }

  return <>{children}</>;
}
