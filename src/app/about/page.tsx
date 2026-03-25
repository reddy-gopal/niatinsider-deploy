"use client";

import {
  CircleHelp,
  Briefcase,
  BadgeCheck,
  Route,
  BookOpenText,
  Users,
  GraduationCap,
  Lightbulb,
  Quote,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const QUESTIONS = [
  { text: 'How are the placements?', icon: Briefcase },
  { text: 'Is NIAT worth it?', icon: BadgeCheck },
  { text: 'What does the NIAT journey really look like?', icon: Route },
];

const DISCOVER = [
  { text: 'Real stories from NIAT students', icon: BookOpenText },
  { text: 'Experiences shared by students in the NIAT ecosystem', icon: Users },
  { text: 'Insights about academics, projects, and learning', icon: Lightbulb },
  { text: 'Advice from seniors for future students', icon: GraduationCap },
  { text: 'A closer look at the NIAT journey through student perspectives', icon: CircleHelp },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#190909] via-[#430f14] to-[#6f121a] text-white">
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            <div className="lg:col-span-2 max-w-4xl">
              <h1 className="font-display text-3xl md:text-5xl font-bold leading-tight">About Insider</h1>
              <p className="mt-5 text-white/90 text-base md:text-lg leading-relaxed">
                A space where NIATians share their stories.
              </p>
              <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
                Choosing where to study can feel confusing, and most of us just want to hear from people who are already going through it.
              </p>
              <p className="mt-3 text-white/80 text-base md:text-lg leading-relaxed">
                NIAT Insider is where NIATians share what their journey has really been like academics, projects, opportunities, and all the stuff that you don’t know.
              </p>
              <p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
                #CompletelyUnfiltered
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-wider text-white/70">Inside NIAT Insider</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-lg bg-white/10 px-3 py-2 text-sm">Student Stories</div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-sm">Open Experiences</div>
                <div className="rounded-lg bg-white/10 px-3 py-2 text-sm">Journey Insights</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-[rgba(30,41,59,0.12)] bg-white p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#1e293b]">Why NIAT Insider Exists</h2>
          <p className="mt-4 text-[#64748b]">When you're exploring the NIAT program, you usually have a lot of questions:</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUESTIONS.map((q, idx) => {
              const Icon = q.icon;
              return (
                <div key={q.text} className="rounded-xl border border-[rgba(30,41,59,0.12)] bg-[#fbfcff] p-5">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#fbf2f3] text-[#991b1b]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#991b1b]">QUESTION {idx + 1}</p>
                  <p className="mt-1 text-[#1e293b] font-medium">{q.text}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-6 rounded-xl bg-[#f8fafc] border border-[rgba(30,41,59,0.12)] px-4 py-3 text-[#475569]">
            Instead of guessing, NIAT Insider connects you with students who are experiencing the NIAT journey.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="rounded-2xl border border-[rgba(30,41,59,0.12)] bg-white p-6 md:p-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#1e293b]">What You’ll Find Here</h2>
          <ul className="mt-6 space-y-3">
            {DISCOVER.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="rounded-xl border border-[rgba(30,41,59,0.12)] bg-[#fbfcff] p-4">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#991b1b] text-white text-xs font-semibold">
                      {idx + 1}
                    </div>
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f6ff] text-[#334155]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-[#1e293b]">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 rounded-xl border border-[rgba(153,27,27,0.25)] bg-[#fbf2f3] px-5 py-4 text-[#4b5563] leading-relaxed">
            <Quote className="h-5 w-5 text-[#991b1b] mb-2" />
            NIAT Insider is where students share their experiences and help the next group figure things out. Students talk openly about what they’ve learned, answer questions, and share what the journey has actually been like.
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
