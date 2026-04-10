import { TALK_TO_SENIORS_URL } from '@/lib/talkToSeniorsUrl';

export default function AskMeAnythingSpotlight() {
  const questions = [
    { emoji: "🗓️", text: "What's the first week like?" },
    { emoji: "💻", text: "How do hackathons work?" },
    { emoji: "🚀", text: "What are internships really like?" },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-[#fff8eb] border-y border-[rgba(153,27,27,0.12)]">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#991b1b] opacity-[0.12] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#991b1b] opacity-[0.08] blur-[100px]" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #991b1b 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center [animation:fadeUp_400ms_ease-out_both]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#991b1b]/30 bg-[#991b1b]/10 px-4 py-1.5 text-sm font-semibold tracking-widest text-[#991b1b] uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#991b1b] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#991b1b]" />
            </span>
            Live Now · 150+ slots booked
          </span>
        </div>

        {/* Heading */}
        <div className="mt-8 text-center [animation:fadeUp_550ms_ease-out_both]">
          <h2
            className="text-5xl md:text-6xl lg:text-7xl font-black text-[#111827] leading-[1.05] tracking-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Ask A{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#991b1b]">Senior</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#991b1b]/30 rounded -z-0" />
            </span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-[#475569] max-w-xl mx-auto leading-relaxed [animation:fadeUp_700ms_ease-out_both]">
            Before you join, you probably have a lot of questions.
          </p>
        </div>

        {/* Question cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 [animation:fadeUp_850ms_ease-out_both]">
          {questions.map(({ emoji, text }, i) => (
            <div
              key={text}
              className="group relative rounded-2xl border border-[rgba(30,41,59,0.12)] bg-white p-6 text-center transition-all duration-300 hover:border-[#991b1b]/45 hover:bg-[#fbf2f3] hover:-translate-y-1 hover:shadow-[0_8px_28px_rgba(153,27,27,0.18)] cursor-default"
              style={{ animationDelay: `${850 + i * 100}ms` }}
            >
              <div className="text-3xl mb-3">{emoji}</div>
              <p className="text-lg font-semibold text-[#1e293b] leading-snug">{text}</p>
              <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-transparent via-[#991b1b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        {/* Sequence under questions: easiest way -> ask students -> hashtag -> CTA */}
        <div className="mt-10 text-center [animation:fadeUp_1100ms_ease-out_both]">
          <p className="text-lg md:text-xl font-semibold text-[#1e293b] tracking-tight leading-tight">
            The easiest way to know?
          </p>
          <p className="mt-0.5 text-lg md:text-xl text-[#334155] leading-tight">
            Ask the students already there.
          </p>
          <p className="mt-0.5 text-xl md:text-2xl font-black italic text-[#1e293b] tracking-tight leading-tight">
            #Unfiltered
          </p>

          <a
            href={TALK_TO_SENIORS_URL}
            className="group relative mt-6 inline-flex items-center gap-3 rounded-xl bg-[#991b1b] px-8 py-4 text-lg font-bold text-white shadow-[0_10px_30px_rgba(153,27,27,0.35)] transition-all duration-300 hover:bg-[#7f1d1d] hover:shadow-[0_14px_36px_rgba(153,27,27,0.45)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Book Your Slot</span>
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            {/* Shimmer */}
            <span className="absolute inset-0 rounded-xl overflow-hidden">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </span>
          </a>
        </div>

      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}