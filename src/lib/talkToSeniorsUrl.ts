/**
 * AMA “Talk to Seniors” lives on a separate app. Vercel rewrites `/talk-to-seniors` in production,
 * but local `next dev` has no rewrite — same-tab navigation to `/talk-to-seniors` was a 404 and
 * could desync the Insider SPA on back/forward.
 */
export const TALK_TO_SENIORS_URL =
  process.env.NEXT_PUBLIC_TALK_TO_SENIORS_URL ?? 'https://niat-ama.vercel.app/talk-to-seniors';
