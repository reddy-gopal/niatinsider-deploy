// Mock Data for NIAT Insider
import type { Campus, Article,Club, Ratings, SearchResult, Comment, StateCount, ArticlePageArticle } from '../types';

export const campuses: Campus[] = [
  {
    id: 1,
    slug: "st-marys-college",
    name: "St. Mary's College",
    university: "St. Mary's Group of Institutions",
    city: "Hyderabad",
    state: "Telangana",
    niatSince: 2023,
    batchSize: 340,
    articleCount: 47,
    rating: 4.2,
    coverColor: "#991b1b",
    coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80",
    logoImage: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=800&q=80",
    sections: ["Top voted articles", "30 days", "Clubs and Communities", "Food", "Living", "Reviews"]
  },
  {
    id: 2,
    slug: "aurora-engineering-college",
    name: "Aurora Engineering College",
    university: "Aurora Group of Institutions",
    city: "Hyderabad",
    state: "Telangana",
    niatSince: 2023,
    batchSize: 280,
    articleCount: 31,
    rating: 3.9,
    coverColor: "#7678ed",
    coverImage: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800&q=80",
    sections: ["Top voted articles", "30 days", "Clubs and Communities", "Food", "Living", "Reviews"]

  },
  {
    id: 3,
    slug: "nsrit",
    name: "NSRIT",
    university: "Narasimha Reddy Engineering College",
    city: "Vizag",
    state: "Andhra Pradesh",
    niatSince: 2024,
    batchSize: 190,
    articleCount: 8,
    rating: null,
    coverColor: "#f18701",
    coverImage: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
    sections: ["Top voted articles", "30 days", "Clubs and Communities", "Food", "Living", "Reviews"]
  },
  {
    id: 4,
    slug: "bs-abdur-rahman",
    name: "BS Abdur Rahman",
    university: "B.S. Abdur Rahman Crescent Institute",
    city: "Chennai",
    state: "Tamil Nadu",
    niatSince: 2023,
    batchSize: 310,
    articleCount: 22,
    rating: 4.0,
    coverColor: "#991b1b",
    coverImage: "https://images.unsplash.com/photo-1606761568499-6d2451b08c66?w=800&q=80",
    sections: ["Top voted articles", "30 days", "Clubs and Communities", "Food", "Living", "Reviews"]
  },
  {
    id: 5,
    slug: "alard-college",
    name: "Alard College",
    university: "Alard College of Engineering",
    city: "Pune",
    state: "Maharashtra",
    niatSince: 2024,
    batchSize: 240,
    articleCount: 4,
    rating: null,
    coverColor: "#5a5cb8",
    coverImage: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800&q=80"
  },
  {
    id: 6,
    slug: "rns-institute-of-technology",
    name: "RNS Institute of Technology",
    university: "RNS Educational Institutions",
    city: "Bangalore",
    state: "Karnataka",
    niatSince: 2023,
    batchSize: 295,
    articleCount: 19,
    rating: 3.7,
    coverColor: "#7f1d1d",
    coverImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
  }
];

export const articles: Article[] = [
  {
    id: 1,
    campusId: 1,
    section: "week1",
    title: "Week 1 at St. Mary's — Complete Survival Guide",
    excerpt: "Everything you need to do in your first 7 days. From registration to finding your IRC coordinator.",
    author: "Priya S.",
    updatedDays: 3,
    upvoteCount: 47,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },
  {
    id: 2,
    campusId: 1,
    section: "living",
    title: "Best PG Options Near St. Mary's — 2025 Guide",
    excerpt: "Honest reviews of 8 PG options within 15 minutes of campus. Prices, safety, and what seniors actually recommend.",
    author: "Rahul M.",
    updatedDays: 12,
    upvoteCount: 38,
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80"
  },
  {
    id: 3,
    campusId: 1,
    section: "academics",
    title: "How IRC Submission Actually Works at St. Mary's",
    excerpt: "The official process is confusing. Here's what actually happens — lab timings, who to approach, and how to avoid the common 3-week delay.",
    author: "Kiran T.",
    updatedDays: 7,
    upvoteCount: 61,
    coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80"
  },
  {
    id: 4,
    campusId: 1,
    section: "food",
    title: "Where to Eat Near Campus — The Complete List",
    excerpt: "From the mess (which is actually decent on Tuesdays) to late-night biryani at Raju's. Budget options under ₹100.",
    author: "Sneha R.",
    updatedDays: 5,
    upvoteCount: 29,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
  },
  {
    id: 5,
    campusId: 1,
    section: "experiences",
    title: "My Internship Journey — Product Company, Hyderabad",
    excerpt: "How I got my first internship in 2nd year, what the selection process looked like, and what skills actually helped.",
    author: "Anonymous",
    updatedDays: 21,
    upvoteCount: 54,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
  }
];



export const clubs: Club[] = [
  // St. Mary's clubs (campusId: 1)
  {
    id: 1,
    campusId: null,
    name: "Coding Club",
    type: "Coding",
    about: "Weekly coding contests, competitive programming, and hackathon prep. The biggest tech club on campus.",
    activities: "LeetCode battles, internal hackathons, mock interview sessions, DSA workshops",
    achievements: "1st place at Inter-College Hackathon 2024, 3 members placed in top national coding contests",
    openToAll: true,
    howToJoin: "Attend the first meeting of each semester — no application needed",
    email: "codecraft@stmarys.ac.in",
    instagram: "@codecraft_stmarys",
    foundedYear: 2022,
    memberCount: 45,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80"
  },
  {
    id: 2,
    campusId: null,
    name: "Cultural Club",
    type: "Cultural",
    about: "Dance, music, drama, and visual arts. Organises the annual Spectrum Fest — the biggest event on campus.",
    activities: "Weekend rehearsals, annual Spectrum Fest in February, inter-college cultural competitions",
    achievements: "Best Cultural Club award at University Fest 2024, performed at state-level youth festival",
    openToAll: true,
    howToJoin: "Auditions held at the start of each semester — open to all years",
    email: "spectrum@stmarys.ac.in",
    instagram: "@spectrum_stmarys",
    foundedYear: 2021,
    memberCount: 62,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80"
  },
  {
    id: 3,
    campusId: null,
    name: "GEN AI Club",
    type: "Coding",
    about: "Focused on machine learning, deep learning, and data science. Runs study groups and project sprints aligned with IRC tracks.",
    activities: "Paper reading sessions, Kaggle competitions, IRC project collaboration, monthly speaker sessions",
    achievements: "2 teams reached national finals of Smart India Hackathon 2024",
    openToAll: true,
    howToJoin: "Fill the interest form at the start of semester — all levels welcome",
    email: "aiml@stmarys.ac.in",
    instagram: "@aimlcircle_stmarys",
    foundedYear: 2023,
    memberCount: 38,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80"
  },
  {
    id: 4,
    campusId: 1,
    name: "NSS Unit",
    type: "Social",
    about: "National Service Scheme. Community service, blood donation drives, and rural outreach programs.",
    activities: "Monthly drives, rural camp (7 days per year), awareness campaigns",
    achievements: "Best NSS Unit award from university 2023",
    openToAll: true,
    howToJoin: "Register with the NSS coordinator at semester start. 120 hours per year required.",
    email: "nss@stmarys.ac.in",
    instagram: null,
    foundedYear: 2019,
    memberCount: 90,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1593113563332-6147431158a5?w=800&q=80"
  },
  {
    id: 5,
    campusId: 1,
    name: "The Literary Society",
    type: "Literary",
    about: "Debates, quizzes, creative writing, and public speaking. For students who think in words.",
    activities: "Weekly debates, inter-college quiz competitions, annual lit fest, creative writing contests",
    achievements: "Won state-level debate championship 2024",
    openToAll: true,
    howToJoin: "Just show up to the first session — no audition required",
    email: "litsoc@stmarys.ac.in",
    instagram: "@litsoc_stmarys",
    foundedYear: 2020,
    memberCount: 29,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead2708?w=800&q=80"
  },

  // Aurora clubs (campusId: 2)
  {
    id: 6,
    campusId: 2,
    name: "Aurora Dev Club",
    type: "Coding",
    about: "Full stack web development and open source contribution. Runs project-based learning cohorts every semester.",
    activities: "Project sprints, hackathons, open source contribution drives, tech talks",
    achievements: "Built and shipped 3 open source tools used by 500+ students",
    openToAll: true,
    howToJoin: "Apply via Instagram DM with your GitHub profile link",
    email: null,
    instagram: "@auroradevclub",
    foundedYear: 2022,
    memberCount: 41,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80"
  },
  {
    id: 7,
    campusId: 2,
    name: "Robotics & IoT Club",
    type: "Robotics",
    about: "Hardware meets software. Builds robots, IoT projects, and participates in national-level robotics competitions.",
    activities: "Weekly build sessions, national robotics competitions, IoT project showcases",
    achievements: "Top 10 at Robocon India 2024",
    openToAll: false,
    howToJoin: "Selection via a short technical test at semester start",
    email: "robotics@aurora.ac.in",
    instagram: "@aurora_robotics",
    foundedYear: 2021,
    memberCount: 24,
    logo: null,
    verifiedDate: "Jan 2026",
    coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"
  }
];

export const ratings: Ratings = {
  hostel: 4.3,
  food: 3.8,
  infrastructure: 4.1,
  socialLife: 4.0,
  totalReviews: 34
};

// Search results mock data
export const searchResults: SearchResult[] = [
  {
    id: 1,
    title: "Best PG Options Near St. Mary's — 2025 Guide",
    campus: "St. Mary's",
    category: "Campus Life",
    excerpt: "Honest reviews of 8 PG options within 15 minutes of campus. Prices, safety, and what seniors actually recommend.",
    updatedDays: 12
  },
  {
    id: 2,
    title: "Hostel vs PG at Aurora — Honest Comparison",
    campus: "Aurora",
    category: "Campus Life",
    excerpt: "A detailed comparison of hostel facilities vs off-campus PG options. Costs, convenience, and community aspects.",
    updatedDays: 21
  },
  {
    id: 3,
    title: "Week 1 at NSRIT — Finding Accommodation Fast",
    campus: "NSRIT",
    category: "Campus Life",
    excerpt: "How to find good PG options within your first week. Tips from seniors who've been through it.",
    updatedDays: 30
  },
  {
    id: 4,
    title: "Off-Campus PG Guide — Hyderabad NIAT Campuses",
    campus: "Global",
    category: "How-To",
    excerpt: "A comprehensive guide to finding PG accommodation near any Hyderabad NIAT campus. Budget tips and safety advice.",
    updatedDays: 60
  }
];

// Comments for article page
export const articleComments: Comment[] = [
  {
    id: 1,
    author: "Ravi K.",
    date: "3 days ago",
    content: "The portal is also down every Sunday for maintenance. Found out the hard way."
  },
  {
    id: 2,
    author: "Ananya M.",
    date: "1 week ago",
    content: "Mr. Venkat is also available on Saturday mornings — not mentioned officially but he's usually in the lab."
  }
];

// Related articles for article page
export const relatedArticles: { id: number; title: string; updatedDays: number; upvoteCount: number }[] = [
  {
    id: 1,
    title: "IRC Project Ideas That Got Selected in 2024",
    updatedDays: 14,
    upvoteCount: 42
  },
  {
    id: 2,
    title: "How to Choose the Right IRC Mentor",
    updatedDays: 21,
    upvoteCount: 35
  },
  {
    id: 3,
    title: "IRC Presentation Tips from Coordinators",
    updatedDays: 28,
    upvoteCount: 28
  }
];

// State counts for campus directory
export const stateCounts: StateCount[] = [
  { name: "All", count: 22 },
  { name: "Telangana", count: 6 },
  { name: "Andhra Pradesh", count: 5 },
  { name: "Tamil Nadu", count: 4 },
  { name: "Karnataka", count: 4 },
  { name: "Maharashtra", count: 3 }
];

// Articles page - full list with categories (featured: true for ids 3, 7, 8)
export const allArticles: ArticlePageArticle[] = [
  // Academics
  {
    id: 1, campusId: 1, campusName: "St. Mary's",
    category: "academics", clubId: null,
    title: "How IRC Submission Actually Works at St. Mary's",
    excerpt: "The official process is confusing. Here's what actually happens — lab timings, who to approach, and the 3-week delay trap.",
    updatedDays: 7, upvoteCount: 61,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },
  {
    id: 2, campusId: 2, campusName: "Aurora",
    category: "academics", clubId: null,
    title: "IRC Lab Access Guide — Aurora Hyderabad",
    excerpt: "Lab timings, slot booking process, and which mentor to approach for project review at Aurora.",
    updatedDays: 14, upvoteCount: 43,
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80"
  },
  {
    id: 3, campusId: 4, campusName: "BS Abdur Rahman",
    category: "academics", clubId: null,
    title: "Completing IRC in 4 Months — A Realistic Timeline",
    excerpt: "Most students take 6+ months. Here's how 3 students from our campus did it in 4. The actual schedule they followed.",
    updatedDays: 21, upvoteCount: 78, featured: true,
    coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80"
  },

  // Campus Life
  {
    id: 4, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Best PG Options Near St. Mary's — 2025 Guide",
    excerpt: "Honest reviews of 8 PG options within 15 minutes of campus. Prices, safety, and what seniors actually recommend.",
    updatedDays: 12, upvoteCount: 38,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
  },
  {
    id: 5, campusId: 2, campusName: "Aurora",
    category: "campus-life", clubId: null,
    title: "Where to Eat Near Aurora — The Definitive List",
    excerpt: "From the mess (which is actually decent) to late-night biryani. Budget options under ₹100.",
    updatedDays: 5, upvoteCount: 29,
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
  },
  {
    id: 6, campusId: 6, campusName: "RNS Bangalore",
    category: "campus-life", clubId: null,
    title: "Off-Campus Living in Bangalore on a Student Budget",
    excerpt: "Bangalore PG prices shock most students from other states. Here's how to find good options under ₹6,000/month near RNS.",
    updatedDays: 9, upvoteCount: 52,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
  },

  // Experiences
  {
    id: 7, campusId: 1, campusName: "St. Mary's",
    category: "experiences", clubId: null,
    title: "My Internship Journey — Product Startup, Hyderabad",
    excerpt: "How I got my first internship in 2nd year through LinkedIn cold outreach. The exact message I used.",
    updatedDays: 21, upvoteCount: 54, featured: true,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
  },
  {
    id: 8, campusId: 4, campusName: "BS Abdur Rahman",
    category: "experiences", clubId: null,
    title: "Campus Drive at BS Abdur Rahman — What the Test Looked Like",
    excerpt: "TCS came to campus in March 2025. 2nd year NIAT students only. 3 sections, 90 minutes. Here's exactly what each section had.",
    updatedDays: 30, upvoteCount: 67, featured: true,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },
  {
    id: 9, campusId: 6, campusName: "RNS Bangalore",
    category: "experiences", clubId: null,
    title: "Remote Internship While in College — How I Managed It",
    excerpt: "Got a remote internship while still attending college. Time management, what my college allowed, IRC impact.",
    updatedDays: 18, upvoteCount: 41,
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80"
  },

  // Academics
  {
    id: 10, campusId: 1, campusName: "St. Mary's",
    category: "academics", clubId: null,
    title: "Balancing NIAT IRC and University Exams — Survival Guide",
    excerpt: "Exam season + IRC deadlines hit at the same time. Here's how seniors at St. Mary's manage both without losing marks.",
    updatedDays: 45, upvoteCount: 33,
    coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80"
  },
  {
    id: 11, campusId: 2, campusName: "Aurora",
    category: "academics", clubId: null,
    title: "Attendance Policy at Aurora — What You Actually Need",
    excerpt: "75% is the rule. But here's how the portal calculates it, and the 3 things that can save you if you're borderline.",
    updatedDays: 60, upvoteCount: 44,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
  },

  // How-To
  {
    id: 12, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Write a Good NIAT Insider Article",
    excerpt: "The difference between an article that gets 2 helpful votes and one that gets 60. Structure, tone, what to include.",
    updatedDays: 15, upvoteCount: 28,
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
  },
  {
    id: 13, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Find Your IRC Coordinator — Any Campus",
    excerpt: "The official contact list is always outdated. Here's the reliable way to find the right person at any NIAT campus.",
    updatedDays: 25, upvoteCount: 36,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
  },

  // Club-linked articles
  {
    id: 14, campusId: 1, campusName: "St. Mary's",
    category: "howto", clubId: 1,
    title: "How to Start Competitive Programming — CodeCraft's Beginner Roadmap",
    excerpt: "The exact roadmap CodeCraft gives every new member. Week 1 to Week 12, all resources included.",
    updatedDays: 8, upvoteCount: 44, featured: false,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
  },
  {
    id: 15, campusId: 1, campusName: "St. Mary's",
    category: "howto", clubId: 1,
    title: "Getting Your First Open Source Contribution — From CodeCraft's Workshop",
    excerpt: "Step-by-step from finding a repo to your first merged PR. Notes from October workshop.",
    updatedDays: 22, upvoteCount: 31, featured: false,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },
  {
    id: 16, campusId: 1, campusName: "St. Mary's",
    category: "experiences", clubId: 1,
    title: "How Winning the Inter-College Hackathon Changed Our Team",
    excerpt: "A recap of the hackathon we won in 2024. What we built, how we prepared, what broke at 3am.",
    updatedDays: 30, upvoteCount: 38, featured: false,
    coverImage: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80"
  },
  {
    id: 17, campusId: 1, campusName: "St. Mary's",
    category: "experiences", clubId: 3,
    title: "How Kaggle Competitions Helped Me Get My Internship",
    excerpt: "Joined AI & ML Circle in semester 1. By semester 3 I had 2 Kaggle medals and an internship offer.",
    updatedDays: 15, upvoteCount: 58, featured: true,
    coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?w=800&q=80"
  },
  {
    id: 18, campusId: 1, campusName: "St. Mary's",
    category: "howto", clubId: 3,
    title: "The AI/ML Circle Weekly Session Format — How We Run It",
    excerpt: "One paper, one project, one presentation per week. The exact format and how to join mid-semester.",
    updatedDays: 10, upvoteCount: 27, featured: false,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"
  },
  {
    id: 19, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: 2,
    title: "Spectrum Fest 2024 — Behind the Scenes",
    excerpt: "Event recap: 6 weeks of rehearsals, 400 attendees, and what actually happened backstage.",
    updatedDays: 45, upvoteCount: 19, featured: false,
    coverImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80"
  },
  {
    id: 20, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: 2,
    title: "What Performing at Spectrum Fest Actually Looks Like",
    excerpt: "Auditions, rehearsal schedule, and why it's worth doing even if you're not a 'cultural person'.",
    updatedDays: 60, upvoteCount: 14, featured: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"
  },
  {
    id: 21, campusId: 2, campusName: "Aurora",
    category: "howto", clubId: 6,
    title: "Aurora Dev Club's Full Stack Learning Path — 16 Weeks",
    excerpt: "The exact curriculum followed each semester. React, Node, PostgreSQL, deployment. All free resources.",
    updatedDays: 6, upvoteCount: 52, featured: true,
    coverImage: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80"
  },
  {
    id: 22, campusId: 2, campusName: "Aurora",
    category: "campus-life", clubId: 6,
    title: "How Aurora Dev Club Shipped 3 Open Source Tools in One Year",
    excerpt: "Project retrospective. What we built, who contributed, what we'd do differently.",
    updatedDays: 18, upvoteCount: 33, featured: false,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },

  // Global how-to guides (isGlobalGuide: true, topic for chips)
  {
    id: 23, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Register for Google Summer of Code (GSoC)?",
    excerpt: "Step-by-step guide: eligibility, finding orgs, proposal tips, and what NIAT students who got selected did differently.",
    updatedDays: 12, upvoteCount: 287, featured: true, isGlobalGuide: true, topic: "GSoC",
    coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80"
  },
  {
    id: 24, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Land a 10 LPA Placement from NIAT?",
    excerpt: "Real strategies from students who cracked 10+ LPA offers. Skills, timeline, campus vs off-campus, and what actually moved the needle.",
    updatedDays: 8, upvoteCount: 256, featured: true, isGlobalGuide: true, topic: "Placements",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
  },
  {
    id: 25, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Start Contributing to Open Source as a Student?",
    excerpt: "From zero to first merged PR. Picking projects, good first issues, and how to balance with college workload.",
    updatedDays: 20, upvoteCount: 198, featured: false, isGlobalGuide: true, topic: "Open Source",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
  },
  {
    id: 26, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Crack Competitive Programming from Scratch?",
    excerpt: "Roadmap, platforms, and the exact practice schedule that helped NIAT students reach CodeChef 3-star and beyond.",
    updatedDays: 15, upvoteCount: 224, featured: false, isGlobalGuide: true, topic: "Competitive Programming",
    coverImage: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80"
  },
  {
    id: 27, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Apply for International Internships?",
    excerpt: "Visa, funding, where to look, and how students from Indian campuses landed roles in the US, EU, and Singapore.",
    updatedDays: 22, upvoteCount: 172, featured: false, isGlobalGuide: true, topic: "Internships",
    coverImage: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
  },
  {
    id: 28, campusId: null, campusName: "Global",
    category: "howto", clubId: null,
    title: "How to Build a Resume That Gets Shortlisted?",
    excerpt: "Sections that matter, ATS-friendly format, and what NIAT students who got 10+ shortlists did differently.",
    updatedDays: 10, upvoteCount: 189, featured: false, isGlobalGuide: true, topic: "Skills",
    coverImage: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80"
  },

  // Top voted student stories (experiences)
  {
    id: 29, campusId: 1, campusName: "St. Mary's",
    category: "experiences", clubId: null,
    title: "I Broke My Code 10 Times. Then It Finally Worked.",
    excerpt: "Nobody told me that breaking things is actually how you learn to build them.",
    updatedDays: 5, upvoteCount: 92, featured: true,
    coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80"
  },
  {
    id: 30, campusId: 1, campusName: "St. Mary's",
    category: "experiences", clubId: null,
    title: "We Had Zero Clients. We Sent 30 DMs. One Said Yes.",
    excerpt: "Starting something with no experience, no portfolio, and no clue — and doing it anyway.",
    updatedDays: 12, upvoteCount: 88, featured: true,
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
  },

  // 30 days at NIAT (campus-life)
  {
    id: 31, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Your First 30 Days at NIAT — What to Do Week by Week",
    excerpt: "A practical week-by-week guide: registration, IRC intro, accommodation, clubs, and how to feel at home by day 30.",
    updatedDays: 4, upvoteCount: 56, featured: true,
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
  },
  {
    id: 32, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "30 Days at St. Mary's: Registration, Lab Access, and Finding Your Feet",
    excerpt: "What I did in my first month — admin queue hacks, meeting my IRC mentor, and the one thing I wish I'd known earlier.",
    updatedDays: 10, upvoteCount: 44, featured: false,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80"
  },

  // Club-related articles (clubId for ClubDetail)
  {
    id: 33, campusId: 1, campusName: "St. Mary's",
    category: "howto", clubId: 1,
    title: "CodeCraft's Weekly Practice Schedule — How to Stay Consistent",
    excerpt: "How the club runs weekly contests and mock interviews. The calendar that actually works for busy semesters.",
    updatedDays: 7, upvoteCount: 39, featured: false,
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
  },
  {
    id: 34, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: 2,
    title: "How to Prepare for Spectrum Fest Auditions — From Someone Who Got In",
    excerpt: "What the judges look for, which slots fill first, and how to pick a piece that stands out without overreaching.",
    updatedDays: 14, upvoteCount: 28, featured: false,
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80"
  },

  // Food (campus-life) — campusSection for campus page
  {
    id: 35, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Best Food Spots Near St. Mary's — Mess, Cafes, and Late-Night Options",
    excerpt: "From the campus canteen to biryani under ₹100. Where to eat when you're broke, in a rush, or celebrating.",
    updatedDays: 6, upvoteCount: 62, featured: true,
    coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    campusSection: "food"
  },
  {
    id: 36, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Where to Eat on a Student Budget — Under ₹50 a Meal",
    excerpt: "Chai, samosa, and full meals that won't break the bank. Verified by 2nd year students who've been there.",
    updatedDays: 11, upvoteCount: 48, featured: false,
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80&fit=crop",
    campusSection: "food"
  },

  // Hostel / living (campus-life) — campusSection for campus page
  {
    id: 37, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Hostel vs PG Near St. Mary's — Honest Comparison 2025",
    excerpt: "Costs, food, WiFi, curfew, and what seniors actually recommend. Plus which hostels have the best IRC crowd.",
    updatedDays: 8, upvoteCount: 55, featured: true,
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    campusSection: "living"
  },
  {
    id: 38, campusId: 1, campusName: "St. Mary's",
    category: "campus-life", clubId: null,
    title: "Finding a PG in Your First Week — What Worked for Me",
    excerpt: "I had no local contacts. Here's how I shortlisted 5 PGs, checked safety, and moved in within 6 days.",
    updatedDays: 15, upvoteCount: 41, featured: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    campusSection: "living"
  },

  // 30 days at NIAT — global (campusId null), same on all campuses for demo
  {
    id: 69, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Your first month at NIAT — Week 1",
    excerpt: "Register, get your ID and lab access, meet your IRC coordinator, and attend orientation. Find accommodation and join the batch WhatsApp group.",
    updatedDays: 3, upvoteCount: 72, featured: true,
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80",
    campusSection: "30days"
  },
  {
    id: 70, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Your first month at NIAT — Week 2",
    excerpt: "Settle into a routine: lab slots, first mentor meeting, and exploring food spots. Start shortlisting IRC project ideas and check out campus clubs.",
    updatedDays: 3, upvoteCount: 68, featured: true,
    coverImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=800&q=80",
    campusSection: "30days"
  },
  {
    id: 71, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Your first month at NIAT — Week 3–4",
    excerpt: "Lock your IRC topic with your mentor, join at least one club, and connect with seniors. By day 30 you should feel part of the campus.",
    updatedDays: 3, upvoteCount: 65, featured: true,
    coverImage: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80",
    campusSection: "30days"
  },

  // Global (campusId null) — shown on every campus like clubs
  {
    id: 72, campusId: null, campusName: "Global",
    category: "experiences", clubId: null,
    title: "I Broke My Code 10 Times. Then It Finally Worked.",
    excerpt: "Nobody told me that breaking things is actually how you learn to build them.",
    updatedDays: 5, upvoteCount: 92, featured: true,
    coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80"
  },
  {
    id: 73, campusId: null, campusName: "Global",
    category: "experiences", clubId: null,
    title: "We Had Zero Clients. We Sent 30 DMs. One Said Yes.",
    excerpt: "Starting something with no experience, no portfolio, and no clue — and doing it anyway.",
    updatedDays: 12, upvoteCount: 88, featured: true,
    coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
  },
  {
    id: 74, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Best Food Spots — Mess, Cafes, and Late-Night Options",
    excerpt: "From the campus canteen to biryani under ₹100. Where to eat when you're broke, in a rush, or celebrating.",
    updatedDays: 6, upvoteCount: 62, featured: true,
    coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    campusSection: "food"
  },
  {
    id: 75, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Where to Eat on a Student Budget — Under ₹50 a Meal",
    excerpt: "Chai, samosa, and full meals that won't break the bank. Verified by 2nd year students who've been there.",
    updatedDays: 11, upvoteCount: 48, featured: false,
    coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80",
    campusSection: "food"
  },
  {
    id: 76, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Hostel vs PG — Honest Comparison 2025",
    excerpt: "Costs, food, WiFi, curfew, and what seniors actually recommend. Plus which hostels have the best IRC crowd.",
    updatedDays: 8, upvoteCount: 55, featured: true,
    coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80",
    campusSection: "living"
  },
  {
    id: 77, campusId: null, campusName: "Global",
    category: "campus-life", clubId: null,
    title: "Finding a PG in Your First Week — What Worked for Me",
    excerpt: "I had no local contacts. Here's how I shortlisted 5 PGs, checked safety, and moved in within 6 days.",
    updatedDays: 15, upvoteCount: 41, featured: false,
    coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    campusSection: "living"
  },

  // Duplicated for campuses 2–6 so every campus has articles in each section (same content, repeated per campus)
  ...(() => {
    const CAMPUSES: { id: number; name: string }[] = [
      { id: 2, name: "Aurora" },
      { id: 3, name: "NSRIT" },
      { id: 4, name: "BS Abdur Rahman" },
      { id: 5, name: "Alard" },
      { id: 6, name: "RNS Bangalore" },
    ];
    const topVotedTemplates: Omit<ArticlePageArticle, 'id' | 'campusId' | 'campusName'>[] = [
      { category: "experiences", clubId: null, title: "I Broke My Code 10 Times. Then It Finally Worked.", excerpt: "Nobody told me that breaking things is actually how you learn to build them.", updatedDays: 5, upvoteCount: 92, featured: true, coverImage: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80" },
      { category: "experiences", clubId: null, title: "We Had Zero Clients. We Sent 30 DMs. One Said Yes.", excerpt: "Starting something with no experience, no portfolio, and no clue — and doing it anyway.", updatedDays: 12, upvoteCount: 88, featured: true, coverImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80" },
    ];
    const foodTemplates: Omit<ArticlePageArticle, 'id' | 'campusId' | 'campusName'>[] = [
      { category: "campus-life", clubId: null, title: "Best Food Spots — Mess, Cafes, and Late-Night Options", excerpt: "From the campus canteen to biryani under ₹100. Where to eat when you're broke, in a rush, or celebrating.", updatedDays: 6, upvoteCount: 62, featured: true, coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", campusSection: "food" },
      { category: "campus-life", clubId: null, title: "Where to Eat on a Student Budget — Under ₹50 a Meal", excerpt: "Chai, samosa, and full meals that won't break the bank. Verified by 2nd year students who've been there.", updatedDays: 11, upvoteCount: 48, featured: false, coverImage: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80", campusSection: "food" },
    ];
    const livingTemplates: Omit<ArticlePageArticle, 'id' | 'campusId' | 'campusName'>[] = [
      { category: "campus-life", clubId: null, title: "Hostel vs PG — Honest Comparison 2025", excerpt: "Costs, food, WiFi, curfew, and what seniors actually recommend. Plus which hostels have the best IRC crowd.", updatedDays: 8, upvoteCount: 55, featured: true, coverImage: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80", campusSection: "living" },
      { category: "campus-life", clubId: null, title: "Finding a PG in Your First Week — What Worked for Me", excerpt: "I had no local contacts. Here's how I shortlisted 5 PGs, checked safety, and moved in within 6 days.", updatedDays: 15, upvoteCount: 41, featured: false, coverImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", campusSection: "living" },
    ];
    let id = 39;
    const out: ArticlePageArticle[] = [];
    for (const campus of CAMPUSES) {
      for (const t of topVotedTemplates) {
        out.push({ ...t, id: id++, campusId: campus.id, campusName: campus.name });
      }
      for (const t of foodTemplates) {
        out.push({ ...t, id: id++, campusId: campus.id, campusName: campus.name });
      }
      for (const t of livingTemplates) {
        out.push({ ...t, id: id++, campusId: campus.id, campusName: campus.name });
      }
    }
    return out;
  })()
];
