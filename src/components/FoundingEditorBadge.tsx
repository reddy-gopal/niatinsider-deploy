"use client";

import { BadgeCheck } from 'lucide-react';

export type FoundingEditorBadgeData = { type: string; awarded_at: string } | null;

interface FoundingEditorBadgeProps {
  badge: FoundingEditorBadgeData;
}

export default function FoundingEditorBadge({ badge }: FoundingEditorBadgeProps) {
  if (!badge) {
    return null;
  }

  const awardedDate = new Date(badge.awarded_at);
  if (Number.isNaN(awardedDate.getTime())) {
    return null;
  }

  const since = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(awardedDate);

  return (
    <div className="relative inline-flex group">
      <span
        className="inline-flex items-center justify-center rounded-full text-[#991b1b] transition-transform duration-300 group-hover:scale-110"
        aria-label="Verified NIAT Student"
      >
        <BadgeCheck className="h-5 w-5 fill-[#fef2f2] stroke-[#991b1b]" />
      </span>
      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#991b1b] px-2.5 py-1.5 text-xs text-white opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1">
        Verified since {since}
      </div>
    </div>
  );
}
