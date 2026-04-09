# Part 1 — middleware, API base, auth client, auth store, layout, login, home

## `middleware.ts` (project root)

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Same env as `src/lib/apiBase.ts` for server-side API origin. */
const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://niatinsider.pythonanywhere.com'
).replace(/\/$/, '');

const STATIC_FILE_EXT = /\.(png|jpg|jpeg|svg|ico|js|css)$/i;

function isPublicPath(pathname: string): boolean {
  if (
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password'
  ) {
    return true;
  }
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon.ico')) {
    return true;
  }
  if (STATIC_FILE_EXT.test(pathname)) {
    return true;
  }
  return false;
}

function forwardSetCookiesFromRefresh(refreshResponse: Response, nextResponse: NextResponse): void {
  const headers = refreshResponse.headers;
  if (typeof headers.getSetCookie === 'function') {
    for (const cookie of headers.getSetCookie()) {
      nextResponse.headers.append('Set-Cookie', cookie);
    }
    return;
  }
  const single = headers.get('Set-Cookie');
  if (single) {
    nextResponse.headers.append('Set-Cookie', single);
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access_token')?.value;
  if (accessToken) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get('refresh_token')?.value;
  if (!refreshToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const refreshUrl = `${API_BASE}/api/token/refresh/`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') ?? '',
      },
      credentials: 'include',
      body: '{}',
      signal: controller.signal,
    });

    if (refreshRes.status !== 200) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const res = NextResponse.next();
    forwardSetCookiesFromRefresh(refreshRes, res);
    return res;
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  } finally {
    clearTimeout(timeoutId);
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml)$).*)',
  ],
};
```

---

## `src/lib/apiBase.ts`

There is no `src/lib/api.ts`; API origin is centralized here.

```ts
export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://niatinsider.pythonanywhere.com'
).replace(/\/$/, '');
```

---

## `src/lib/authApi.ts`

Full file as of snapshot (includes `ensureRefreshed`, `fetchMe`, interceptors, login helpers).

```ts
import axios from 'axios';
import { API_BASE } from './apiBase';
import { useAuthStore } from '@/store/authStore';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

/** Axios instance for auth endpoints; retries with refresh token on 401. */
export const authApi = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;
let authFailureHandled = false;

/** Same join semantics as axios (baseURL + url), so pathname matches the real request. */
function combineURLs(baseURL: string, relativeURL: string): string {
  const rel = relativeURL.split('?')[0];
  return rel
    ? `${baseURL.replace(/\/+$/, '')}/${rel.replace(/^\/+/, '')}`
    : baseURL;
}

/**
 * Pathname of the request as axios actually sends it. `new URL('/profiles/me/', base)` is wrong
 * here: a leading `/` on `url` is host-absolute and drops the `/api` segment from `baseURL`.
 */
export function requestPathnameFromConfig(config: { baseURL?: string; url?: string }): string {
  const base = config.baseURL ?? '';
  const rawUrl = config.url ?? '';
  if (!rawUrl) return '';
  const url = rawUrl.split('?')[0];
  if (/^https?:\/\//i.test(url)) {
    try {
      return new URL(url).pathname;
    } catch {
      return '';
    }
  }
  if (!base) {
    return url.startsWith('/') ? url : `/${url}`;
  }
  const full = combineURLs(base, url);
  try {
    return new URL(full).pathname;
  } catch {
    return '';
  }
}

type AuthRetryConfig = { baseURL?: string; url?: string; skipAuthRetry?: boolean };

/**
 * Do not chain refresh/logout on these 401s:
 * - Requests explicitly marked optional (`skipAuthRetry`, e.g. bootstrap / fetchMe for guests).
 * - Auth endpoints themselves (prevents loops and pointless work on login failures).
 *
 * Do not path-match `/profiles/me` or `/auth/me` here — a logged-in user with an expired access
 * token still needs refresh on those routes.
 */
export function shouldSkipAuthRetry(config?: AuthRetryConfig): boolean {
  if (config?.skipAuthRetry) return true;
  const path = requestPathnameFromConfig(config ?? {});
  if (!path) return false;
  return (
    /\/token\/refresh\/?$/.test(path) ||
    /\/auth\/logout\/?$/.test(path) ||
    /\/auth\/login\/phone-password\/?$/.test(path) ||
    /\/auth\/login\/phone\/?$/.test(path) ||
    /\/token\/?$/.test(path)
  );
}

export async function ensureRefreshed(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = api
    .post('/token/refresh/', {})
    .then(() => {
      authFailureHandled = false;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

export async function handleAuthFailureRedirect(): Promise<void> {
  if (authFailureHandled) return;
  authFailureHandled = true;
  try {
    await api.post('/auth/logout/', {});
  } catch {
    // Best effort server cleanup.
  }
  await useAuthStore.getState().clearAuth({ callLogout: false });
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.replace('/login');
  }
}

authApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config ?? {};
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (authFailureHandled || shouldSkipAuthRetry(original as AuthRetryConfig) || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await ensureRefreshed();
      return authApi(original);
    } catch {
      await handleAuthFailureRedirect();
      return Promise.reject(error);
    }
  }
);

export interface MeProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified_senior: boolean;
}

/** Founding Editor profile (one-to-one with user): campus, LinkedIn, year joined. */
export interface FoundingEditorProfile {
  linkedin_profile: string;
  campus_id: string | null;
  campus_name: string;
  year_joined: number | null;
}

export async function fetchMe(): Promise<MeProfile | null> {
  try {
    await ensureRefreshed().catch(() => {});
    const { data } = await authApi.get<MeProfile>('/auth/me/', { skipAuthRetry: true });
    return data;
  } catch {
    return null;
  }
}

export async function updateMeProfile(payload: Partial<Pick<MeProfile, 'username' | 'email'>>): Promise<MeProfile> {
  const { data } = await authApi.patch<MeProfile>('/auth/me/', payload);
  return data;
}

/** Get Founding Editor profile (college details). 403 if user is not founding_editor. */
export async function fetchFoundingEditorProfile(): Promise<FoundingEditorProfile | null> {
  try {
    const { data } = await authApi.get<FoundingEditorProfile>('/auth/me/profile/');
    return data;
  } catch {
    return null;
  }
}

/** True if Founding Editor profile has required onboarding fields (campus, LinkedIn, year joined). */
export function isOnboardingComplete(profile: FoundingEditorProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.campus_id != null &&
    !!profile.linkedin_profile?.trim() &&
    profile.year_joined != null
  );
}

/** Update Founding Editor profile (college details). */
export async function updateFoundingEditorProfile(
  payload: Partial<FoundingEditorProfile>
): Promise<FoundingEditorProfile> {
  const { data } = await authApi.patch<FoundingEditorProfile>('/auth/me/profile/', payload);
  return data;
}

export async function completeOnboarding(): Promise<{ is_onboarded: boolean }> {
  const { data } = await authApi.post<{ is_onboarded: boolean }>('/auth/onboarding/complete/');
  return data;
}

/** Request OTP by phone. for: "register" | "login" */
export async function requestOtpByPhone(
  phone: string,
  opts?: { for?: 'register' | 'login' }
): Promise<{ message: string }> {
  const body: { phone: string; for?: string } = { phone };
  if (opts?.for) body.for = opts.for;
  const { data } = await api.post<{ message: string }>('/verification/otp/request/', body);
  return data;
}

/** Verify OTP by phone. */
export async function verifyOtpByPhone(phone: string, code: string): Promise<{ verified: boolean }> {
  const { data } = await api.post<{ verified: boolean }>('/verification/otp/verify/', { phone, code });
  return data;
}

/** Log in with phone + OTP. Returns JWT; store with setTokens. */
export async function loginByPhoneOtp(
  phone: string,
  code: string
): Promise<{ access: string }> {
  const { data } = await api.post<{ access: string }>('/auth/login/phone/', {
    phone,
    code,
  });
  return data;
}

/** Log in with mobile number + password. Returns JWT; store with setTokens. */
export async function loginByPhonePassword(
  phone: string,
  password: string
): Promise<{ access: string }> {
  const { data } = await api.post<{ access: string }>('/auth/login/phone-password/', {
    phone: phone.trim(),
    password,
  });
  return data;
}

/** Register (NIAT Insider: source=niatverse → role founding_editor). */
export async function registerNiatverse(payload: {
  username: string;
  phone: string;
  password: string;
}): Promise<{ id: string; username: string; email: string; phone: string }> {
  const { data } = await api.post<{ id: string; username: string; email: string; phone: string }>(
    '/auth/register/',
    { ...payload, source: 'niatverse' }
  );
  return data;
}

/** Log in with username + password (e.g. after register). Returns JWT. */
export async function loginByUsernamePassword(
  username: string,
  password: string
): Promise<{ access: string }> {
  const { data } = await api.post<{ access: string }>('/token/', { username, password });
  return data;
}

export async function requestForgotPasswordOtp(phone_number: string): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>('/auth/forgot-password/request/', { phone_number: phone_number.trim() });
  return data;
}

export async function verifyForgotPasswordOtp(phone_number: string, code: string): Promise<{ verified: boolean }> {
  const { data } = await api.post<{ verified: boolean }>('/auth/forgot-password/verify/', {
    phone_number: phone_number.trim(),
    code: code.trim(),
  });
  return data;
}

export async function resetPasswordWithOtp(payload: {
  phone_number: string;
  code: string;
  new_password: string;
  confirm_password: string;
}): Promise<{ detail: string }> {
  const { data } = await api.post<{ detail: string }>('/auth/forgot-password/reset-confirm/', payload);
  return data;
}

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  const { data } = await authApi.get<{ available: boolean }>('/auth/username-available/', {
    params: { username: username.trim() },
  });
  return data;
}

export async function requestChangePhoneOtp(phone_number: string): Promise<{ detail: string }> {
  const { data } = await authApi.post<{ detail: string }>('/auth/change-phone/request-otp/', {
    phone_number: phone_number.trim(),
  });
  return data;
}

export async function confirmChangePhone(phone_number: string, code: string): Promise<{ detail: string }> {
  const { data } = await authApi.post<{ detail: string }>('/auth/change-phone/confirm/', {
    phone_number: phone_number.trim(),
    code: code.trim(),
  });
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ detail: string }> {
  const { data } = await authApi.post<{ detail: string }>('/auth/change-password/', payload);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout/', {});
  } finally {
    authFailureHandled = false;
    await useAuthStore.getState().clearAuth({ callLogout: false });
  }
}
```

---

## `src/store/authStore.ts`

```ts
import { create } from 'zustand';
import { authApi, ensureRefreshed } from '@/lib/authApi';

type AuthUser = { id: string; username: string; phone: string } | null;
export type AuthRole = 'intermediate_student' | 'niat_student' | 'founding_editor' | 'moderator' | 'admin' | null;
export type NiatStatus = 'pending' | 'approved' | 'rejected' | null;
type AuthBadge = { type: string; awarded_at: string } | null;

export const AUTH_ROLES = {
  intermediate: 'intermediate_student',
  niat: 'niat_student',
  foundingEditor: 'founding_editor',
  moderator: 'moderator',
  admin: 'admin',
} as const;

export const WRITE_ENABLED_ROLES: ReadonlyArray<Exclude<AuthRole, 'intermediate_student' | 'niat_student' | null>> = [
  AUTH_ROLES.foundingEditor,
  AUTH_ROLES.moderator,
  AUTH_ROLES.admin,
];

interface ProfilesMeResponse {
  user?: { id?: string; username?: string; phone?: string; phone_number?: string } | null;
  role?: AuthRole;
  is_onboarded?: boolean;
  profile?: { status?: NiatStatus } | null;
  badge?: AuthBadge;
}

export interface AuthState {
  user: AuthUser;
  role: AuthRole;
  isOnboarded: boolean;
  niatStatus: NiatStatus;
  badge: AuthBadge;
  authChecked: boolean;
  setAuth: (data: Partial<AuthState>) => void;
  clearAuth: (opts?: { callLogout?: boolean }) => Promise<void>;
  bootstrapAuth: (opts?: { force?: boolean }) => Promise<void>;
}

let logoutInFlight = false;
let bootstrapInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isOnboarded: false,
  niatStatus: null,
  badge: null,
  authChecked: false,
  setAuth: (data) => set((state) => ({ ...state, ...data })),
  clearAuth: async (opts) => {
    const shouldCallLogout = opts?.callLogout ?? true;
    if (shouldCallLogout && !logoutInFlight) {
      logoutInFlight = true;
      try {
        await authApi.post('/auth/logout/', {});
      } catch {
        // Best effort server cleanup.
      } finally {
        logoutInFlight = false;
      }
    }
    set({
      user: null,
      role: null,
      isOnboarded: false,
      niatStatus: null,
      badge: null,
      authChecked: true,
    });
  },
  bootstrapAuth: async (opts) => {
    const force = Boolean(opts?.force);
    if (!force && useAuthStore.getState().authChecked) {
      return;
    }
    if (bootstrapInFlight) {
      return bootstrapInFlight;
    }

    bootstrapInFlight = (async () => {
      try {
        // Access JWT is short-lived (e.g. 15m); refresh is HttpOnly. Refresh here so the
        // following request does not 401 while skipAuthRetry is true (which would clear
        // session without ever rotating the access cookie). Guests: refresh fails → ignored.
        await ensureRefreshed().catch(() => {});
        const { data } = await authApi.get<ProfilesMeResponse>('/profiles/me/', {
          skipAuthRetry: true,
        });
        const role = data?.role ?? null;
        const profile = data?.profile ?? null;
        const user = data?.user
          ? {
              id: String(data.user.id ?? ''),
              username: String(data.user.username ?? ''),
              phone: String(data.user.phone ?? data.user.phone_number ?? ''),
            }
          : null;
        const fallbackUser = role
          ? {
              id: '',
              username: 'authenticated',
              phone: '',
            }
          : null;

        set({
          user: user && user.username ? user : fallbackUser,
          role,
          isOnboarded: Boolean(data?.is_onboarded),
          niatStatus: role === 'niat_student' ? (profile?.status ?? null) : null,
          badge: data?.badge ?? null,
          authChecked: true,
        });
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 401) {
          set({
            user: null,
            role: null,
            isOnboarded: false,
            niatStatus: null,
            badge: null,
            authChecked: true,
          });
        }
      } finally {
        bootstrapInFlight = null;
      }
    })();

    return bootstrapInFlight;
  },
}));
```

---

## `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NIAT Insider | The Ultimate Guide to NIAT Campus Life & Admissions",
    template: "%s | NIAT Insider",
  },
  description:
    "Everything you need to know about NIAT. Read authentic student-written reviews, admission guides, campus life details, placements, clubs, and hostels at NIAT.",
  keywords: [
    "NIAT",
    "niat insider",
    "niat university",
    "niat admissions",
    "niat campus life",
    "niat placements",
    "niat btech reviews",
    "niat hostel review",
    "niat student platform",
    "college guide india",
  ],
  metadataBase: new URL("https://www.niatinsider.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/niat.svg", type: "image/svg+xml" }],
    shortcut: ["/niat.svg"],
    apple: ["/niat.svg"],
  },
  openGraph: {
    type: "website",
    url: "https://www.niatinsider.com",
    siteName: "NIAT Insider",
    title: "NIAT Insider | The Ultimate Guide to NIAT Campus Life & Admissions",
    description:
      "Everything you need to know about NIAT. Read authentic student-written reviews, admission guides, campus life details, placements, clubs, and hostels at NIAT.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "NIAT Insider",
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "NIAT Insider | The Ultimate Guide to NIAT Campus Life & Admissions",
    description:
      "Everything you need to know about NIAT. Read authentic student-written reviews, admission guides, campus life details, placements, clubs, and hostels at NIAT.",
    images: ["/og-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "NIAT Insider",
    url: "https://www.niatinsider.com",
    logo: "https://www.niatinsider.com/niat.svg",
    sameAs: ["https://www.niatinsider.com"],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
```

---

## `src/app/login/page.tsx`

```tsx
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}
```

---

## `src/app/page.tsx` (home)

```tsx
import { API_BASE } from '../lib/apiBase';
import { apiCampusToCampus } from '../lib/campusUtils';
import type { CampusListItem } from '../types/campusApi';
import type { ApiArticle, PaginatedResponse } from '../types/articleApi';
import HomePageClient from './HomePageClient';

export default async function HomePage() {
  const [campusesRes, latestArticlesRes, featuredArticlesRes] = await Promise.all([
    fetch(`${API_BASE}/api/campuses/`, { next: { revalidate: 86400 }, credentials: 'include' }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&page_size=12`, { next: { revalidate: 3600 }, credentials: 'include' }),
    fetch(`${API_BASE}/api/articles/articles/?status=published&featured=true&page_size=12`, { next: { revalidate: 3600 }, credentials: 'include' }),
  ]);

  const campusesJson = campusesRes.ok
    ? await campusesRes.json() as CampusListItem[] | { results?: CampusListItem[] }
    : [];
  const apiCampuses = Array.isArray(campusesJson) ? campusesJson : (campusesJson.results ?? []);
  const campuses = apiCampuses.map(apiCampusToCampus);

  const latestJson = latestArticlesRes.ok
    ? await latestArticlesRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[]
    : [];
  const featuredJson = featuredArticlesRes.ok
    ? await featuredArticlesRes.json() as PaginatedResponse<ApiArticle> | ApiArticle[]
    : [];

  const latestArticles = Array.isArray(latestJson) ? latestJson : (latestJson.results ?? []);
  const featuredArticles = Array.isArray(featuredJson) ? featuredJson : (featuredJson.results ?? []);

  return (
    <HomePageClient
      campuses={campuses}
      latestArticles={latestArticles}
      featuredArticles={featuredArticles}
    />
  );
}
```
