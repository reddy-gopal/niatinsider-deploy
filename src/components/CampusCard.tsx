"use client";

import Link from 'next/link';
import { memo } from 'react';
import { Star } from 'lucide-react';
import type { Campus } from '../types';
import ImageWithFallback from './ImageWithFallback';
interface CampusCardProps {
  campus: Campus;
}

function CampusCard({ campus }: CampusCardProps) {
  return (
    <Link
      href={`/${campus.slug}`}
      prefetch={false}
      className="block bg-section rounded-lg border border-transparent shadow-card overflow-hidden hover:shadow-lg hover:border-[#991b1b]/30 transition-all duration-200 will-change-transform hover:-translate-y-0.5"
    >
      {/* Campus Image Area */}
      <div className="relative h-48 w-full">
        <ImageWithFallback
          src={campus.coverImage}
          alt={campus.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="p-5">
        {/* Campus name */}
        <h3 className="font-display text-lg font-bold text-black mb-1">
          {campus.name}
        </h3>

        {/* University */}
        <p className="text-sm text-black mb-2 line-clamp-1">
          {campus.university}
        </p>

        {/* Location */}
        <p className="text-sm text-black mb-3">
          {campus.city}, {campus.state}
        </p>

        {/* Stats row — rating only (article count hidden for now) */}
        {campus.rating != null && campus.rating > 0 && (
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 text-[#f7b801] fill-[#f7b801] mr-1" />
            <span className="font-medium text-black">{campus.rating}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default memo(CampusCard);
