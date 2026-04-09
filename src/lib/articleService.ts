import { articlesApi } from './articlesApi';
import type {
  ApiArticle,
  ArticleUpdatePayload,
  ArticleWritePayload,
  ModerationPayload,
  PaginatedResponse,
  SuggestionPayload,
  UpvoteStatus,
} from '../types/articleApi';
import { nextAuthApi } from './authApi';

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiSubcategory {
  slug: string;
  label: string;
  requires_other: boolean;
}

export const articleService = {
  list(params?: Record<string, string | number | boolean | undefined>) {
    return articlesApi.get<PaginatedResponse<ApiArticle>>('articles/', { params });
  },
  getCategories() {
    return articlesApi.get<ApiCategory[]>('categories/');
  },
  /** Subcategories for a category. Pass campusId for campus-scoped categories (e.g. club-directory). */
  getSubcategories(categorySlug: string, campusId?: string | null) {
    if (!categorySlug) return Promise.resolve({ data: [] as ApiSubcategory[] });
    return articlesApi.get<ApiSubcategory[]>('subcategories/', {
      params: { category: categorySlug, ...(campusId ? { campus_id: campusId } : {}) },
    });
  },
  /** Fetch next page using the full URL from paginated response (e.g. data.next) */
  listNextPage(nextUrl: string) {
    return articlesApi.get<PaginatedResponse<ApiArticle>>(nextUrl);
  },
  detail(id: string | number) {
    return articlesApi.get<ApiArticle>(`articles/${id}/`);
  },
  preview(id: string | number) {
    return nextAuthApi.get<ApiArticle>(`/api/proxy/articles/articles/${id}/preview`);
  },
  editDetail(id: string | number) {
    return nextAuthApi.get<ApiArticle>(`/api/proxy/articles/articles/${id}/edit`);
  },
  getUpvoteStatus(articleId: string | number) {
    return nextAuthApi.get<UpvoteStatus>(`/api/proxy/articles/articles/${articleId}/upvote-status`);
  },
  toggleUpvote(articleId: string | number) {
    return nextAuthApi.post<{ upvote_count: number; upvoted: boolean }>(`/api/proxy/articles/articles/${articleId}/upvote`, {});
  },
  submitSuggestion(articleId: string | number, payload: SuggestionPayload) {
    return nextAuthApi.post<{ success: boolean }>(`/api/proxy/articles/articles/${articleId}/suggest`, payload);
  },
  incrementView(articleId: string | number) {
    return articlesApi.post<{ ok: boolean }>(`articles/${articleId}/view/`);
  },
  /** Creates article with status pending_review when save_as_draft is false. */
  create(payload: ArticleWritePayload) {
    return nextAuthApi.post<ApiArticle>('/api/articles/articles', payload);
  },
  update(id: string | number, payload: ArticleUpdatePayload) {
    return nextAuthApi.patch<ApiArticle>(`/api/articles/articles/${id}`, payload);
  },
  delete(id: string | number) {
    return nextAuthApi.delete(`/api/proxy/articles/articles/${id}`);
  },
  myArticles() {
    return nextAuthApi.get<PaginatedResponse<ApiArticle>>('/api/proxy/articles/articles/my-articles');
  },
  pendingQueue() {
    return nextAuthApi.get<PaginatedResponse<ApiArticle>>('/api/proxy/articles/articles/pending');
  },
  moderate(id: string | number, payload: ModerationPayload) {
    return nextAuthApi.post<ApiArticle>(`/api/proxy/articles/articles/${id}/moderate`, payload);
  },
  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return nextAuthApi.post<{ url: string }>('/api/articles/upload_image', formData);
  },
};
