"use client";

import Link from 'next/link';
import { AlertCircle, Clock3 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

export default function NiatStatusBanner() {
  const role = useAuthStore((state) => state.role);
  const niatStatus = useAuthStore((state) => state.niatStatus);

  if (role !== AUTH_ROLES.niat) {
    return null;
  }

  if (niatStatus === 'pending') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <Alert className="border-blue-200 bg-blue-50 text-blue-900">
          <Clock3 className="h-4 w-4" />
          <AlertTitle>Profile Verification In Progress</AlertTitle>
          <AlertDescription className="text-blue-800">
            Your profile is under review. We&apos;ll notify you once a moderator verifies it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (niatStatus === 'rejected') {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 lg:px-8">
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Profile Verification Needed</AlertTitle>
          <AlertDescription className="text-amber-800">
            <span>Your profile was not approved. Please update your profile and resubmit.</span>
            <Link
              href="/onboarding/profile"
              className="mt-2 inline-flex items-center rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-800 transition-colors"
            >
              Update Profile
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}
