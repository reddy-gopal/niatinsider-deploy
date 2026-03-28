import axios from 'axios';
import { API_BASE } from './apiBase';
import type { LeaderboardWriter } from '@/types/articleApi';

/** Base URL: trailing slash so POST 'articles/' -> /api/articles/articles/ */
export const articlesApi = axios.create({
  baseURL: `${API_BASE}/api/articles/`,
  headers: { 'Content-Type': 'application/json' },
});

articlesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('niat_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

articlesApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('niat_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string }>(`${API_BASE}/api/token/refresh/`, { refresh });
          localStorage.setItem('niat_access', data.access);
          document.cookie = `niat_access=${data.access}; path=/; max-age=86400`;
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return articlesApi(original);
        } catch {
          localStorage.removeItem('niat_access');
          document.cookie = 'niat_access=; path=/; max-age=0';
          document.cookie = 'niat_onboarded=; path=/; max-age=0';
          document.cookie = 'niat_needs_onboarding=; path=/; max-age=0';
          localStorage.removeItem('niat_refresh');
        }
      }
    }
    return Promise.reject(error);
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
