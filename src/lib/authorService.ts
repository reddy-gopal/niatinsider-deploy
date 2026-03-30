import axios from 'axios';
import { API_BASE } from './apiBase';
import type { ApiArticle } from '@/types/articleApi';

export interface ApiAuthorProfile {
  id: string;
  username: string;
  role: string;
  is_verified_senior: boolean;
  follower_count: number;
  is_followed_by_me: boolean | null;
  linkedin_profile: string;
  campus_id: string | null;
  campus_name: string;
  year_joined: number | null;
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
    return axios.get<AuthorArticlesResponse>(
      `${API_BASE}/api/authors/${encodeURIComponent(username)}/`,
      { params }
    );
  },
};

