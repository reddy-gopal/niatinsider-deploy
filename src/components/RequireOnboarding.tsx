"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { fetchMe, fetchFoundingEditorProfile, isOnboardingComplete } from '../lib/authApi';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Protects platform routes: logged-in Founding Editors must complete onboarding
 * (campus, LinkedIn, year joined) before accessing Home and the rest of the app.
 * Redirects to /onboarding until profile is complete.
 */
export default function RequireOnboarding({ children }: RequireOnboardingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirect'>('loading');

  useEffect(() => {
    const token = localStorage.getItem('niat_access');
    if (!token) {
      setStatus('allowed');
      return;
    }
    fetchMe()
      .then((me) => {
        if (!me || me.role !== 'founding_editor') {
          setStatus('allowed');
          return;
        }
        return fetchFoundingEditorProfile().then((profile) => {
          if (isOnboardingComplete(profile)) {
            setStatus('allowed');
          } else {
            setStatus('redirect');
          }
        });
      })
      .catch(() => setStatus('allowed'));
  }, [pathname]);

  useEffect(() => {
    if (status === 'redirect') {
      const from = pathname || '/';
      router.replace(`/onboarding?from=${encodeURIComponent(from)}`);
    }
  }, [status, pathname, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
      </div>
    );
  }

  if (status === 'redirect') return null;

  return <>{children}</>;
}
