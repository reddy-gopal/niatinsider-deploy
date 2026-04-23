import { nextAuthApi } from './authApi';
import type { ApiArticle } from '@/types/articleApi';

type AuthorBadge = { type: string; awarded_at: string } | null;

export interface ApiAuthorProfile {
  id: string;
  username: string;
  profile_slug?: string | null;
  role: string;
  is_verified_senior: boolean;
  follower_count: number;
  is_followed_by_me: boolean | null;
  linkedin_profile: string;
  campus_id: string | null;
  campus_name: string;
  year_joined: number | null;
  badge?: AuthorBadge;
}

export interface AuthorArticlesResponse {
  author: ApiAuthorProfile;
  count: number;
  next: string | null;
  previous: string | null;
  articles: ApiArticle[];
}

export const authorService = {
  getByUsername(username: string, params?: { page?: number; page_size?: number }) {
    return nextAuthApi.get<AuthorArticlesResponse>(`/api/proxy/authors/${encodeURIComponent(username)}/`, {
      params,
    });
  },
};

