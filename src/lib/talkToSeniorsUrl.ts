// Production: same-origin `/talk-to-seniors` → Edge middleware proxies AMA and strips
// Set-Cookie so Insider cookies are not clobbered (see middleware.ts).
// Local dev: direct AMA URL (no local proxy); override anytime with NEXT_PUBLIC_TALK_TO_SENIORS_URL.

export const TALK_TO_SENIORS_URL =
  process.env.NEXT_PUBLIC_TALK_TO_SENIORS_URL ||
  (process.env.NODE_ENV === 'production'
    ? '/talk-to-seniors'
    : 'https://niat-ama.vercel.app/talk-to-seniors');
