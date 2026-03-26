/** Campus from GET /api/campuses/ (directory API). */
export interface CampusListItem {
  id: string;
  name: string;
  shortName: string | null;
  location: string;
  state: string;
  imageUrl: string;
  slug: string;
  isDeemed: boolean;
  googleMapLink?: string | null;
  description?: string;
  articleCount?: number;
}
