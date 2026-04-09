"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AUTH_ROLES,
  WRITE_ENABLED_ROLES,
  useAuthStore,
  type AuthRole,
  type NiatStatus,
} from '@/store/authStore';

type WriterRole = Exclude<AuthRole, 'intermediate_student' | 'niat_student' | null>;

interface WriteArticleCTAProps {
  href?: string;
  label: ReactNode;
  className: string;
  icon?: ReactNode;
  iconAfter?: ReactNode;
  disabledClassName?: string;
  subtitleClassName?: string;
  disabledMessage?: string;
}

export default function WriteArticleCTA({
  href = '/contribute/write',
  label,
  className,
  icon,
  iconAfter,
  disabledClassName = 'cursor-not-allowed opacity-60',
  subtitleClassName = 'mt-1 text-xs text-[#64748b]',
  disabledMessage = 'Profile under review — writing unlocks once verified.',
}: WriteArticleCTAProps) {
  const role = useAuthStore((state) => state.role);
  const niatStatus = useAuthStore((state) => state.niatStatus);

  if (role === AUTH_ROLES.intermediate) {
    return null;
  }

  if (role === AUTH_ROLES.niat) {
    const title = niatStatus ?? 'pending';
    return (
      <div className="inline-flex flex-col" title={disabledMessage}>
        <span
          aria-disabled="true"
          data-niat-status={title}
          className={`${className} ${disabledClassName}`}
        >
          {icon}
          {label}
          {iconAfter}
        </span>
        <span className={subtitleClassName}>{disabledMessage}</span>
      </div>
    );
  }

  if (role && WRITE_ENABLED_ROLES.includes(role as WriterRole)) {
    return (
      <Link href={href} className={className}>
        {icon}
        {label}
        {iconAfter}
      </Link>
    );
  }

  return null;
}
