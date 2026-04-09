"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * Protects platform routes: logged-in Intermediate/NIAT students must complete onboarding
 * before accessing Home and the rest of the app.
 * Redirects to /onboarding until profile is complete.
 */
export default function RequireOnboarding({ children }: RequireOnboardingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const authChecked = useAuthStore((state) => state.authChecked);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const [status, setStatus] = useState<'loading' | 'allowed' | 'redirect'>('loading');

  useEffect(() => {
    if (!authChecked) return;
    const isAuthenticated = user !== null;
    const isLearnerRole = role === AUTH_ROLES.intermediate || role === AUTH_ROLES.niat;
    const isPrivilegedRole =
      role === AUTH_ROLES.verifiedNiat || role === AUTH_ROLES.moderator || role === AUTH_ROLES.admin;
    const hasKnownRole = isLearnerRole || isPrivilegedRole;
    const needsOnboarding =
      isAuthenticated &&
      (
        !hasKnownRole ||
        (isLearnerRole && !isOnboarded)
      );
    setStatus(needsOnboarding ? 'redirect' : 'allowed');
  }, [authChecked, user, role, isOnboarded, pathname]);

  useEffect(() => {
    if (status === 'redirect') {
      const from = pathname || '/';
      router.replace(`/onboarding/role?from=${encodeURIComponent(from)}`);
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
