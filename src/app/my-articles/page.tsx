"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, CheckCircle2, Clock3, PenLine, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WriteArticleCTA from '@/components/WriteArticleCTA';
import { useCampuses } from '@/hooks/useCampuses';
import { useMyArticles } from '@/hooks/useArticles';
import type { ArticleStatus } from '@/types/articleApi';
import { AUTH_ROLES, useAuthStore } from '@/store/authStore';

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
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const niatStatus = useAuthStore((state) => state.niatStatus);
  const authChecked = useAuthStore((state) => state.authChecked);
  const canWrite =
    role !== AUTH_ROLES.niat || niatStatus === 'approved';
  const getCampusSlug = (id: string | number) =>
    apiCampuses.find((c) => String(c.id) === String(id))?.slug ?? String(id);
  const getArticleHref = (article: { campus_id: string | null; slug: string; status: ArticleStatus }) => {
    const basePath = article.campus_id ? `/${getCampusSlug(article.campus_id)}/article/${article.slug}` : `/article/${article.slug}`;
    return article.status === 'published' ? basePath : `${basePath}/preview`;
  };

  useEffect(() => {
    if (!authChecked) return;
    if (user && role !== 'intermediate_student') {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace('/');
    }
  }, [authChecked, user, role, router]);

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
              <div className="rounded-2xl border border-[rgba(153,27,27,0.15)] bg-gradient-to-br from-[#fff7f7] to-white p-5 sm:p-6 mb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-[#991b1b]/10 p-2">
                    <BarChart3 className="h-5 w-5 text-[#991b1b]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e293b]">No articles yet</h2>
                    <p className="text-sm text-[#64748b]">
                      Start your first story and track review progress from this dashboard.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-[rgba(30,41,59,0.1)] bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Submitted</p>
                    <p className="mt-1 text-2xl font-bold text-[#1e293b]">0</p>
                  </div>
                  <div className="rounded-xl border border-[rgba(30,41,59,0.1)] bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Review stage</p>
                    <p className="mt-1 text-sm font-semibold text-amber-700">Ready to submit</p>
                  </div>
                  <div className="rounded-xl border border-[rgba(30,41,59,0.1)] bg-white p-3">
                    <p className="text-xs uppercase tracking-wide text-[#64748b]">Publish rate</p>
                    <p className="mt-1 text-2xl font-bold text-[#1e293b]">--</p>
                  </div>
                </div>

                {role === AUTH_ROLES.niat && niatStatus !== 'approved' && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-800">
                      Your profile is under review. Writing will unlock after verification.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="rounded-xl border border-[rgba(30,41,59,0.1)] p-3 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <PenLine className="h-4 w-4 text-[#991b1b]" />
                    <p className="text-sm font-semibold text-[#1e293b]">Step 1</p>
                  </div>
                  <p className="text-sm text-[#64748b]">Write your campus story with clear title and images.</p>
                </div>
                <div className="rounded-xl border border-[rgba(30,41,59,0.1)] p-3 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock3 className="h-4 w-4 text-amber-600" />
                    <p className="text-sm font-semibold text-[#1e293b]">Step 2</p>
                  </div>
                  <p className="text-sm text-[#64748b]">Track review status here after submission.</p>
                </div>
                <div className="rounded-xl border border-[rgba(30,41,59,0.1)] p-3 bg-white">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-semibold text-[#1e293b]">Step 3</p>
                  </div>
                  <p className="text-sm text-[#64748b]">Published articles appear with live performance stats.</p>
                </div>
              </div>

              {canWrite && (
                <>
                  <p className="text-[#64748b] mb-4">You haven’t submitted any articles yet.</p>
                  <WriteArticleCTA
                    label="Write your first article"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#991b1b] px-4 py-2 text-sm font-medium text-white hover:bg-[#7f1d1d] transition-colors"
                    icon={<PenLine className="h-4 w-4" />}
                  />
                </>
              )}
            </div>
          ) : (
            <ul className="space-y-4">
              {articles.map((a) => (
                <li key={a.id} className="p-4 rounded-xl border border-[rgba(30,41,59,0.1)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={getArticleHref(a)}
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
