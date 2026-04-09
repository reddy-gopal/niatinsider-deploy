import axios from 'axios';
import { API_BASE } from './apiBase';
import { ensureRefreshed, handleAuthFailureRedirect, shouldSkipAuthRetry } from './authApi';
import type { LeaderboardWriter } from '@/types/articleApi';

/** Base URL: trailing slash so POST 'articles/' -> /api/articles/articles/ */
export const articlesApi = axios.create({
  baseURL: `${API_BASE}/api/articles/`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

articlesApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config ?? {};
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (shouldSkipAuthRetry(original) || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await ensureRefreshed();
      return articlesApi(original);
    } catch {
      await handleAuthFailureRedirect();
      return Promise.reject(error);
    }
  }
);

function normalizeLeaderboardResponse(
  data: LeaderboardWriter[] | { results?: LeaderboardWriter[] } | null | undefined
): LeaderboardWriter[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

export async function getLeaderboard(campusId: string): Promise<LeaderboardWriter[]> {
  if (!campusId) return [];

  const { data } = await articlesApi.get<LeaderboardWriter[] | { results?: LeaderboardWriter[] }>(
    'articles/leaderboard/',
    { params: { campus_id: campusId } }
  );

  return normalizeLeaderboardResponse(data)
    .map((entry) => ({
      author_username: entry.author_username,
      article_count: Number(entry.article_count) || 0,
      total_views: Number(entry.total_views) || 0,
    }))
    .sort((a, b) => b.total_views - a.total_views)
    .slice(0, 3);
}
