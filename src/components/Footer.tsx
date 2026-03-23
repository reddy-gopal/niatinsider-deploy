import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { usePublishedArticles } from '../hooks/useArticles';

const HOW_TO_GUIDES_URL = '/how-to-guides';

interface FooterProps {
  loadGuides?: boolean;
}

export default function Footer({ loadGuides = true }: FooterProps) {
  const { articles: globalGuideArticles } = usePublishedArticles(
    { is_global_guide: true, page_size: 4, ordering: 'upvote_count' },
    { enabled: loadGuides }
  );
  const guides = useMemo(
    () => [...globalGuideArticles].slice(0, 4),
    [globalGuideArticles]
  );
  return (
    <footer className="bg-black text-white pt-10 pb-8 sm:pt-12 sm:pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top CTA strip */}
        <div className="mb-8 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/80">
              Have questions or stories to share? Join the NIAT Insider student community.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="/talk-to-seniors"
                className="inline-flex items-center rounded-md bg-[#991b1b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#7f1d1d] transition-colors"
              >
                Ask Seniors
              </a>
              <Link
                to="/contribute/write"
                className="inline-flex items-center rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors"
              >
                Write Article
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-3">
              <span className="font-display text-2xl font-bold text-white">NIAT</span>
              <span className="font-body text-xl font-medium text-white/80 ml-1">Insider</span>
            </div>
            <p className="text-white/60 text-sm max-w-xs">
              Every NIAT campus. Mapped by students. Built to help students make smarter choices.
            </p>
          </div>

          {/* Quick links (valid routes only) */}
          <div>
            <h3 className="font-display font-semibold text-white mb-3">Explore</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <Link to="/" className="text-white/60 hover:text-white text-sm transition-colors">Home</Link>
              <Link to="/about" className="text-white/60 hover:text-white text-sm transition-colors">About</Link>
              <Link to="/campuses" className="text-white/60 hover:text-white text-sm transition-colors">Campuses</Link>
              <Link to="/articles" className="text-white/60 hover:text-white text-sm transition-colors">Articles</Link>
              <a href="/talk-to-seniors" className="text-white/60 hover:text-white text-sm transition-colors">Talk To Seniors</a>
              <Link to={HOW_TO_GUIDES_URL} className="text-white/60 hover:text-white text-sm transition-colors">How-to Guides</Link>
            </div>
          </div>

          {/* Guides */}
          <div>
            <h3 className="font-display font-semibold text-white mb-3">Trending Guides</h3>
            <ul className="space-y-2">
              {guides.map((guide) => (
                <li key={guide.id}>
                  <Link
                    to={`/article/${guide.slug || guide.id}`}
                    className="text-white/60 hover:text-white text-sm transition-colors line-clamp-1"
                  >
                    {guide.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to={HOW_TO_GUIDES_URL}
                  className="text-white/80 hover:text-white text-sm transition-colors inline-flex items-center"
                >
                  View all guides →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-white/40 text-sm">
            Built by NIAT students, for NIAT students. {new Date().getFullYear()}.
          </p>
        </div>
      </div>
    </footer>
  );
}
