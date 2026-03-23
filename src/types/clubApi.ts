import type { ClubType } from './index';

export interface ApiClub {
  id: number;
  campus_id: string;
  campus_name: string;
  name: string;
  slug: string;
  type: ClubType;
  about: string;
  activities?: string;
  achievements?: string;
  open_to_all: boolean;
  how_to_join?: string;
  email?: string;
  instagram?: string;
  founded_year?: number | null;
  member_count: number;
  logo_url?: string;
  cover_image?: string;
  verified_at?: string | null;
  article_count?: number;
  is_active: boolean;
  created_at?: string;
  updated_at: string;
}
