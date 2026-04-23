"use client";

import { Crown } from "lucide-react";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { getAuthorProfileHref } from "@/lib/authorRoute";

type LeaderboardUser = {
  author_username: string;
  author_profile_slug: string;
  article_count: number;
  user_id?: string;
  avatar_url?: string;
};

type RankedUser = LeaderboardUser & { rank: number; originalIndex: number };

type LeaderboardProps = {
  users: LeaderboardUser[];
  currentUserId?: string;
  isLoading?: boolean;
  subtitle?: string;
  showHeader?: boolean;
};

function getInitial(authorSlug: string): string {
  const value = (authorSlug || "").trim();
  return value ? value.charAt(0).toUpperCase() : "?";
}

function getRankColor(rank: number): string {
  if (rank === 1) return "#f7b801";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#cd7f32";
  return "#991b1b";
}

function getPodiumHeight(rank: number): number {
  if (rank === 1) return 120;
  if (rank === 2) return 96;
  if (rank === 3) return 80;
  return 72;
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

function LoadingSkeleton() {
  return (
    <>
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 animate-fade-slide-up">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-[var(--card-shadow)]"
          >
            <div className="mb-3 h-4 w-16 rounded-full bg-[#f3f4f6]" />
            <div className="mb-3 h-10 w-10 rounded-full bg-[#e5e7eb]" />
            <div className="mb-2 h-4 w-24 rounded bg-[#f3f4f6]" />
            <div className="h-12 rounded-xl bg-[#f9fafb]" />
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-[var(--card-border)] bg-white shadow-[var(--card-shadow)] overflow-hidden animate-fade-slide-up">
        <div className="grid grid-cols-[72px_1fr_110px] bg-[#fff8eb] px-4 py-3">
          <div className="h-4 w-8 rounded bg-[#f3f4f6]" />
          <div className="h-4 w-14 rounded bg-[#f3f4f6]" />
          <div className="justify-self-end h-4 w-16 rounded bg-[#f3f4f6]" />
        </div>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-[72px_1fr_110px] items-center px-4 py-3 border-t border-[#f8f1f1]">
            <div className="h-4 w-8 rounded bg-[#f8fafc]" />
            <div className="h-4 w-32 rounded bg-[#f3f4f6]" />
            <div className="justify-self-end h-4 w-10 rounded bg-[#f3f4f6]" />
          </div>
        ))}
      </section>
    </>
  );
}

export default function Leaderboard({
  users,
  currentUserId,
  isLoading = false,
  subtitle = "Top student contributors",
  showHeader = true,
}: LeaderboardProps) {
  const rankedUsers = useMemo<RankedUser[]>(() => {
    return [...users]
      .map((user, index) => ({ ...user, originalIndex: index }))
      .sort((a, b) => {
        if (b.article_count !== a.article_count) return b.article_count - a.article_count;
        return a.originalIndex - b.originalIndex;
      })
      .map((user, index) => ({ ...user, rank: index + 1 }));
  }, [users]);

  const first = rankedUsers.find((u) => u.rank === 1);
  const second = rankedUsers.find((u) => u.rank === 2);
  const third = rankedUsers.find((u) => u.rank === 3);
  const podium = [second, first, third].filter(Boolean) as RankedUser[];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (rankedUsers.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-[var(--card-border)] bg-white px-6 py-12 text-center shadow-[var(--card-shadow)]">
        <h2 className="text-lg font-bold text-[var(--text-dark)]">No leaderboard data yet.</h2>
      </section>
    );
  }

  return (
    <div
      className="w-full"
      style={
        {
          ["--primary" as string]: "#991b1b",
          ["--primary-hover" as string]: "#b91c1c",
          ["--primary-dark" as string]: "#7f1d1d",
          ["--bg-base" as string]: "#ffffff",
          ["--bg-warm" as string]: "#fff8eb",
          ["--bg-tint" as string]: "#fbf2f3",
          ["--text-base" as string]: "#1e293b",
          ["--text-muted" as string]: "#64748b",
          ["--text-dark" as string]: "#111827",
          ["--text-secondary" as string]: "#334155",
          ["--card-border" as string]: "#f1e8e8",
          ["--card-shadow" as string]: "0 2px 16px rgba(153, 27, 27, 0.08)",
        } as CSSProperties
      }
    >
      {showHeader && (
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-[var(--text-dark)] mb-2">🏆 Leaderboard</h2>
          <p className="inline-flex rounded-full border border-[var(--card-border)] bg-[var(--bg-warm)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
            {subtitle}
          </p>
        </header>
      )}

      <section className="mb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end animate-fade-slide-up">
          {podium.map((user) => {
            const color = getRankColor(user.rank);
            const height = getPodiumHeight(user.rank);
            const isFirst = user.rank === 1;
            const isCurrent = currentUserId && user.user_id && currentUserId === user.user_id;

            return (
              <Link
                key={`podium-${user.rank}-${user.author_profile_slug}`}
                href={getAuthorProfileHref(user.author_profile_slug)}
                aria-label={`View @${user.author_username} profile`}
                className={`rounded-2xl border border-[var(--card-border)] bg-[var(--bg-base)] p-4 shadow-[var(--card-shadow)] text-center ${isFirst ? "sm:-translate-y-1" : ""}`}
                style={{ animationDuration: `${300 + user.rank * 80}ms` }}
              >
                <div className="mb-2 flex items-center justify-center">
                  {isFirst ? (
                    <Crown className="h-5 w-5" style={{ color }} aria-label="First place" />
                  ) : (
                    <span aria-label={`Rank ${user.rank} medal`} className="text-lg">
                      {user.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  )}
                </div>

                <div className="mx-auto mb-2 h-12 w-12 overflow-hidden rounded-full border-2 bg-[var(--bg-tint)] flex items-center justify-center text-sm font-bold text-[var(--text-base)]" style={{ borderColor: color }}>
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar_url} alt={`${user.author_username} avatar`} className="h-full w-full object-cover" />
                  ) : (
                    getInitial(user.author_username)
                  )}
                </div>

                <p className="truncate text-sm font-semibold text-[var(--text-base)]" title={user.author_username}>
                  @{user.author_username}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">{formatCount(user.article_count)} articles</p>
                {isCurrent && (
                  <span className="mt-2 inline-flex rounded-full bg-[var(--bg-tint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                    You
                  </span>
                )}

                <div
                  className="mt-4 rounded-xl bg-gradient-to-t from-white"
                  style={{ height, backgroundImage: `linear-gradient(to top, ${color}33, #ffffff)` }}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--card-border)] bg-[var(--bg-base)] shadow-[var(--card-shadow)] overflow-hidden animate-fade-slide-up">
        <header className="grid grid-cols-[72px_1fr_110px] gap-2 bg-[var(--bg-warm)] px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <span>#</span>
          <span>User</span>
          <span className="justify-self-end">Articles</span>
        </header>

        <div className="max-h-[560px] overflow-y-auto">
          {rankedUsers.map((user) => {
            const isCurrent = currentUserId && user.user_id && currentUserId === user.user_id;
            const accent = isCurrent ? "#991b1b" : getRankColor(user.rank);

            return (
              <Link
                key={`${user.rank}-${user.author_profile_slug}-${user.originalIndex}`}
                href={getAuthorProfileHref(user.author_profile_slug)}
                aria-label={`View @${user.author_username} profile`}
                className="grid grid-cols-[72px_1fr_110px] items-center gap-2 px-4 py-3 border-t border-[#f8f1f1] hover:bg-[var(--bg-tint)] transition-colors"
                style={{ borderLeft: `4px solid ${accent}` }}
              >
                <span className="text-sm font-bold text-[var(--text-secondary)]">{user.rank}</span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-base)]" title={user.author_username}>
                    @{user.author_username}
                  </p>
                  {isCurrent && (
                    <span className="mt-1 inline-flex rounded-full bg-[var(--bg-tint)] px-2 py-0.5 text-[10px] font-semibold text-[var(--primary)]">
                      You
                    </span>
                  )}
                </div>

                <span className="justify-self-end text-sm font-bold text-[var(--primary)]">{formatCount(user.article_count)}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <style jsx>{`
        .animate-fade-slide-up {
          animation: fadeSlideUp 420ms ease-out both;
        }
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
