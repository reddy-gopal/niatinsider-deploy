export type ArticleStatus = 'draft' | 'pending_review' | 'published' | 'rejected';
export type ArticleCategory = 'onboarding-kit' | 'survival-food' | 'club-directory' | 'career-wins' | 'local-travel' | 'amenities';
export type GuideTopic =
  | 'Placements'
  | 'Open Source'
  | 'Internships'
  | 'Competitive Programming'
  | 'GSoC'
  | 'Skills';

export interface ApiArticle {
  id: string;
  campus_id: string | null;
  campus_name: string;
  category: ArticleCategory;
  category_id?: string | null;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  images?: string[];
  status: ArticleStatus;
  featured: boolean;
  upvote_count: number;
  view_count: number;
  is_global_guide: boolean;
  topic: GuideTopic | '';
  subcategory: string;
  subcategory_other: string;
  author_username: string;
  author_linkedin_profile?: string | null;
  published_at: string | null;
  updated_at: string;
  updated_days: number;
  body?: string;
  rejection_reason?: string;
  reviewed_at?: string | null;
  created_at?: string;
}

export interface UpvoteStatus {
  upvote_count: number;
  upvoted: boolean;
}

export type SuggestionType =
  | 'missing_info'
  | 'outdated_content'
  | 'wrong_info'
  | 'add_club_or_facility'
  | 'other';

export interface SuggestionPayload {
  type: SuggestionType;
  content: string;
  is_anonymous?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ArticleWritePayload {
  campus_id: string | null;
  campus_name: string;
  category?: ArticleCategory;
  category_id?: string | null;
  title: string;
  excerpt: string;
  body: string;
  cover_image?: string;
  images?: string[];
  is_global_guide: boolean;
  topic?: GuideTopic | '';
  subcategory?: string;
  subcategory_other?: string;
  save_as_draft?: boolean;
}

/** For PATCH: optional fields + status when author submits or saves draft */
export type ArticleUpdatePayload = Partial<ArticleWritePayload> & { status?: 'draft' | 'pending_review' };

export interface ModerationPayload {
  status: 'published' | 'rejected';
  rejection_reason?: string;
  featured?: boolean;
}
