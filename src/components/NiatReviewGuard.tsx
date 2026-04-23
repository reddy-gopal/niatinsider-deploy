"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AUTH_ROLES, useAuthStore } from "@/store/authStore";

interface NiatReviewGuardProps {
  children: React.ReactNode;
}

export default function NiatReviewGuard({ children }: NiatReviewGuardProps) {
  const router = useRouter();
  const authChecked = useAuthStore((state) => state.authChecked);
  const role = useAuthStore((state) => state.role);
  const niatReviewCompleted = useAuthStore((state) => state.niat_review_completed);

  useEffect(() => {
    const isNiatRole = role === AUTH_ROLES.niat || role === AUTH_ROLES.verifiedNiat;
    if (authChecked && isNiatRole && !niatReviewCompleted) {
      router.replace("/onboarding/review");
    }
  }, [authChecked, role, niatReviewCompleted, router]);

  if (!authChecked) return null;

  const isNiatRole = role === AUTH_ROLES.niat || role === AUTH_ROLES.verifiedNiat;
  if (isNiatRole && !niatReviewCompleted) return null;

  return <>{children}</>;
}
