export interface Campus {
  id: string | number;
  slug: string;
  name: string;
  university: string;
  city: string;
  state: string;
  description?: string;
  googleMapLink?: string | null;
  niatSince: number;
  batchSize: number;
  articleCount: number;
  rating: number | null;
  coverColor: string;
  coverImage: string;
  logoImage?: string;
  sections?: string[];
}

export interface Article {
  id: number;
  slug?: string;
  campusId: string | number;
  section: string;
  title: string;
  excerpt: string;
  author: string;
  updatedDays: number;
  /** Display as upvote count (replaces former "helpful") */
  upvoteCount: number;
  coverImage?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  area: string;
  priceMin: number;
  priceMax: number;
  tags: string[];
  foodIncluded: boolean;
  wifiAvailable: boolean;
  safetyNote: string;
  verifiedDate: string;
  image?: string;
}

export interface FoodSpot {
  name: string;
  type: string;
  area: string;
  priceRange: string;
  specialty: string;
  lateNight: boolean;
  swiggy: boolean;
  image?: string;
}

export interface Faculty {
  name: string;
  designation: string;
  department: string;
  roleAtNiat: string;
  email: string;
  linkedin: string;
  highestQual: string;
  specialization: string;
  subjectsTeaching: string;
  verifiedDate: string;
}

export interface Experience {
  id: number;
  campusId: number;
  domain: string;
  companyType: string;
  cityOfWork: string;
  duration: string;
  howSelected: string;
  excerpt: string;
  skillsThatHelped: string[];
  yearOfStudy: string;
  isAnonymous: boolean;
  publishedDate: string;
  image?: string;
}

export type ClubType =
  | 'Coding'
  | 'Cultural'
  | 'Sports'
  | 'Literary'
  | 'Robotics'
  | 'Social'
  | 'Music'
  | 'Dance'
  | 'NIAT Circle';

export interface Club {
  id: number;
  campusId: number | null;
  name: string;
  type: ClubType;
  about: string;
  activities: string;
  achievements: string;
  openToAll: boolean;
  howToJoin: string;
  email: string | null;
  instagram: string | null;
  foundedYear: number;
  memberCount: number;
  logo: string | null;
  verifiedDate: string;
  coverImage?: string;
  logoImage?: string;
}

export interface Ratings {
  hostel: number;
  food: number;
  infrastructure: number;
  socialLife: number;
  totalReviews: number;
}

export interface SearchResult {
  id: number;
  title: string;
  campus: string;
  category: string;
  excerpt: string;
  updatedDays: number;
}

export interface Comment {
  id: number;
  author: string;
  date: string;
  content: string;
}

export interface StateCount {
  name: string;
  count: number;
}

export type ArticleCategory = 'campus-life' | 'experiences' | 'academics' | 'howto';

export type GuideTopic =
  | 'Placements'
  | 'Open Source'
  | 'Internships'
  | 'Competitive Programming'
  | 'GSoC'
  | 'Skills';

/** Used on campus detail page to list articles in Food / Living / 30 days sections */
export type CampusSectionTag = 'food' | 'living' | '30days';

export interface ArticlePageArticle {
  id: string | number;
  slug?: string;
  campusId: string | number | null;
  campusName: string;
  category: ArticleCategory;
  title: string;
  excerpt: string;
  updatedDays: number;
  upvoteCount: number;
  featured?: boolean;
  clubId?: number | null;
  coverImage?: string;
  isGlobalGuide?: boolean;
  topic?: GuideTopic;
  /** Optional: show in Food or Living section on campus page */
  campusSection?: CampusSectionTag;
}
