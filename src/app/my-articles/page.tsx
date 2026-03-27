"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCampuses } from '@/hooks/useCampuses';
import { fetchMe } from '@/lib/authApi';
import { useMyArticles } from '@/hooks/useArticles';
import type { ArticleStatus } from '@/types/articleApi';

const STATUS_STYLE: Record<ArticleStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_review: 'bg-amber-100 text-amber-800',
  published: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function MyArticles() {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const { articles, loading, error, refetch } = useMyArticles();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { campuses: apiCampuses } = useCampuses();
  const getCampusSlug = (id: string | number) =>
    apiCampuses.find((c) => String(c.id) === String(id))?.slug ?? String(id);

  useEffect(() => {
    fetchMe().then((profile) => {
      if (profile) {
        setAllowed(true);
      } else {
        setAllowed(false);
        router.replace('/');
      }
    });
  }, [router]);

  if (allowed === null || !allowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="font-playfair text-2xl font-bold text-[#1e293b] mb-2">My Articles</h1>
          <p className="text-[#64748b] mb-6">View and manage your submitted articles.</p>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => refetch()} className="px-3 py-1 bg-red-100 rounded font-medium">Retry</button>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
            </div>
          ) : articles.length === 0 ? (
            <div className="py-8">
              <p className="text-[#64748b] mb-4">You haven’t submitted any articles yet.</p>
              <Link
                href="/contribute/write"
                className="inline-flex items-center gap-2 rounded-lg bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors"
              >
                <PenLine className="h-4 w-4" />
                Write your first article
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {articles.map((a) => (
                <li key={a.id} className="p-4 rounded-xl border border-[rgba(30,41,59,0.1)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={a.campus_id ? `/campus/${getCampusSlug(a.campus_id)}/article/${a.slug}` : `/article/${a.slug}`}
                      className="font-medium text-[#991b1b] hover:underline"
                    >
                      {a.title}
                    </Link>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${STATUS_STYLE[a.status]}`}>
                      {a.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748b] mt-1">
                    {a.category} · {a.campus_name || 'Global'} · Updated {a.updated_days} days ago · 👍 {a.upvote_count}
                  </p>
                  {a.status === 'rejected' && a.rejection_reason && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === String(a.id) ? null : String(a.id))}
                        className="text-sm text-red-600 hover:underline"
                      >
                        {expandedId === String(a.id) ? 'Hide' : 'Show'} rejection reason
                      </button>
                      {expandedId === String(a.id) && (
                        <p className="mt-1 text-sm text-red-700 bg-red-50 p-2 rounded">{a.rejection_reason}</p>
                      )}
                    </div>
                  )}
                  {(a.status === 'draft' || a.status === 'pending_review' || a.status === 'rejected') && (
                    <Link
                      href={`/contribute/write?edit=${a.id}`}
                      className="inline-block mt-2 text-sm text-[#991b1b] hover:underline"
                    >
                      Edit
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
