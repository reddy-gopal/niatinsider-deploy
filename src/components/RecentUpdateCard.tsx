"use client";

import Link from 'next/link';
import { User, ThumbsUp } from 'lucide-react';
import ImageWithFallback from './ImageWithFallback';
import type { ApiArticle } from '../types/articleApi';

interface RecentUpdateCardProps {
  article: ApiArticle;
  campusSlug: string;
}

/**
 * Card used only in the "Recent updates" section on the campus page.
 * Shows: title, excerpt, "Written by [author]", and helpful (upvote) count.
 */
export default function RecentUpdateCard({ article, campusSlug }: RecentUpdateCardProps) {
  const articleKey = article.slug || article.id;
  const href = article.campus_id
    ? `/${campusSlug}/article/${articleKey}`
    : `/article/${articleKey}`;

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl shadow-card overflow-hidden border border-transparent hover:border-[#991b1b]/30 transition-colors"
    >
      {article.cover_image && (
        <div className="h-36 w-full overflow-hidden">
          <ImageWithFallback
            src={article.cover_image}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-display font-medium text-[#1e293b] mb-1 line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-[#64748b] line-clamp-2 mb-2">
          {article.excerpt}
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3" />
            Written by {article.author_username || 'Unknown'}
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <ThumbsUp className="h-3.5 w-3 shrink-0" />
            {article.upvote_count} found this helpful
          </span>
        </div>
      </div>
    </Link>
  );
}
