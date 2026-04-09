"use client";

import Link from 'next/link';
import { ThumbsUp, Clock } from 'lucide-react';
import type { Article } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface ArticleCardProps {
  article: Article;
  /** Campus slug for URL (e.g. niat-amet-university). */
  campusSlug: string;
}

export default function ArticleCard({ article, campusSlug }: ArticleCardProps) {
  const articleKey = article.slug || article.id;
  return (
    <Link
      href={`/${campusSlug}/article/${articleKey}`}
      className="block bg-white rounded-xl shadow-card hover:border-[#991b1b] transition-all duration-200 overflow-hidden border-l-4 border-transparent"
    >
      {article.coverImage && (
        <div className="h-44 w-full overflow-hidden">
          <ImageWithFallback src={article.coverImage} alt={article.title} loading="lazy" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-black mb-2 line-clamp-2">
          {article.title}
        </h3>

        <p className="text-sm text-black mb-3 line-clamp-2">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs text-black">
          <div className="flex items-center space-x-3">
            <Link
              href={`/author/${article.author}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:text-[#991b1b] transition-colors"
            >
              By {article.author}
            </Link>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {article.updatedDays === 0 ? 'Today' : `${article.updatedDays} days ago`}
            </span>
          </div>
          <div className="flex items-center">
            <ThumbsUp className="h-3 w-3 mr-1" />
            <span>{article.upvoteCount} upvote{article.upvoteCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
