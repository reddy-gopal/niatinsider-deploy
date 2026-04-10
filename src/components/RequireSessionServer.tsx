import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface Props {
  fallbackFrom: string;
  children: React.ReactNode;
}

export default async function RequireSessionServer({ fallbackFrom, children }: Props) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    redirect(`/login?from=${encodeURIComponent(fallbackFrom)}`);
  }

  return <>{children}</>;
}
