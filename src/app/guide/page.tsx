"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  BookOpen,
  Calendar,
  Briefcase,
  Edit3,
  MessageCircle,
  MapPin,
  FileText,
  HelpCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const SECTIONS = [
  {
    id: 'overview',
    icon: BookOpen,
    title: 'What is NIAT Insider?',
    description:
      'NIAT Insider maps every NIAT campus with real information from students: week-one guides, living, food, clubs, experiences, and how-to guides. Use it to find your campus, prepare for joining, or explore others.',
    links: [
      { label: 'Browse all 22 campuses', to: '/campuses' },
      { label: 'Search campus, topic, or article', to: '/search' },
    ],
  },
  {
    id: 'week1',
    icon: Calendar,
    title: 'Week 1 at NIAT',
    description:
      'Your first week can feel overwhelming. We have campus-specific guides written by students: what to do first, accommodation, orientation, and where to find help.',
    links: [
      { label: 'Find your campus', to: '/campuses' },
      { label: 'Campus Life articles', to: '/articles?category=campus-life' },
    ],
  },
  {
    id: 'experiences',
    icon: Briefcase,
    title: 'Internship & placement experiences',
    description:
      'Seniors share how they got internships and placements, what worked, and what they’d do differently. Read by campus or browse global how-to guides on placements and internships.',
    links: [
      { label: 'Experiences articles', to: '/articles?category=experiences' },
      { label: 'Placements & internships guides', to: '/how-to-guides' },
    ],
  },
  {
    id: 'contribute',
    icon: Edit3,
    title: 'How to contribute',
    description:
      'Share what you know: write articles, add food spots, share experiences or trips. Your campus page and the global how-to guides grow when students contribute.',
    links: [
      { label: 'Contribute (write, add spots, share)', to: '/contribute' },
      { label: 'How-to guides', to: '/how-to-guides' },
    ],
  },
  {
    id: 'qa',
    icon: MessageCircle,
    title: 'NIAT Q&A System',
    description:
      'A dedicated place where prospective students ask questions and seniors answer. The Q&A site is built and we’re integrating it into NIAT Insider soon—you’ll be able to ask and answer from here.',
    links: [
      { label: 'Q&A integration coming soon', to: '#' },
    ],
    comingSoon: true,
  },
];

export default function Guide() {
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window === 'undefined') return;
      const hash = window.location.hash;
      if (!hash) return;
      const id = hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);
    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <section className="bg-section py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-black mb-3">
            New to NIAT? Start here.
          </h1>
          <p className="text-black/80 text-base md:text-lg">
            A single guide to the whole NIAT Insider app—campuses, experiences, contributing, and the Q&A system.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-10">
            {SECTIONS.map(({ id, icon: Icon, title, description, links, comingSoon }) => (
              <article
                key={id}
                id={id}
                className="scroll-mt-24 border-b border-[rgba(30,41,59,0.1)] pb-10 last:border-0 last:pb-0"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-[#fbf2f3] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-[#991b1b]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-xl font-bold text-black mb-2">
                      {title}
                      {comingSoon && (
                        <span className="ml-2 text-sm font-normal text-amber-600">
                          (Coming soon)
                        </span>
                      )}
                    </h2>
                    <p className="text-[#64748b] text-sm md:text-base mb-4">
                      {description}
                    </p>
                    <ul className="space-y-2">
                      {links.map(({ label, to }) => (
                        <li key={label}>
                          <Link
                            href={to}
                            className={`inline-flex items-center text-sm font-medium ${
                              to === '#'
                                ? 'text-[#94a3b8] cursor-default'
                                : 'text-[#991b1b] hover:underline'
                            }`}
                            onClick={to === '#' ? (e) => e.preventDefault() : undefined}
                          >
                            {label}
                            {to !== '#' && <ChevronRight className="h-4 w-4 ml-0.5" />}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-[#fefce8] border-t border-[rgba(30,41,59,0.08)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-display text-sm font-semibold text-[#64748b] uppercase tracking-wider mb-4">
            Quick links
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/campuses"
              className="inline-flex items-center text-[#991b1b] font-medium text-sm hover:underline"
            >
              <MapPin className="h-4 w-4 mr-1.5" />
              Campuses
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center text-[#991b1b] font-medium text-sm hover:underline"
            >
              <FileText className="h-4 w-4 mr-1.5" />
              Articles
            </Link>
            <Link
              href="/how-to-guides"
              className="inline-flex items-center text-[#991b1b] font-medium text-sm hover:underline"
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              How-to guides
            </Link>
            <Link
              href="/contribute"
              className="inline-flex items-center text-[#991b1b] font-medium text-sm hover:underline"
            >
              <Edit3 className="h-4 w-4 mr-1.5" />
              Contribute
            </Link>
            <span className="inline-flex items-center text-[#94a3b8] text-sm">
              <HelpCircle className="h-4 w-4 mr-1.5" />
              Q&A (coming soon)
            </span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
