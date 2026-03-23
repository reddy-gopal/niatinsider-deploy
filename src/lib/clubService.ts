import { articlesApi } from './articlesApi';
import type { ApiClub } from '../types/clubApi';
import type { PaginatedResponse } from '../types/articleApi';

export const clubService = {
  list(params?: Record<string, string | number | boolean | undefined>) {
    return articlesApi.get<PaginatedResponse<ApiClub>>('clubs/', { params });
  },
  detail(id: string | number) {
    return articlesApi.get<ApiClub>(`clubs/${id}/`);
  },
};
