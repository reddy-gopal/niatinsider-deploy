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

/**
 * Same-origin Next.js API routes used only for auth cookie domain bridging.
 * Keeps HttpOnly cookies on the frontend domain so middleware can read them.
 */
export const nextAuthApi = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let refreshPromise: Promise<void> | null = null;
let authFailureHandled = false;

export function getAuthFailureHandled(): boolean {
  return authFailureHandled;
}

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
    /\/api\/auth\/refresh\/?$/.test(path) ||
    /\/api\/auth\/session\/?$/.test(path) ||
    /\/api\/auth\/token\/?$/.test(path) ||
    /\/api\/auth\/login-phone\/?$/.test(path) ||
    /\/auth\/logout\/?$/.test(path) ||
    /\/api\/auth\/logout\/?$/.test(path) ||
    /\/auth\/login\/phone-password\/?$/.test(path) ||
    /\/api\/auth\/login\/?$/.test(path) ||
    /\/auth\/login\/phone\/?$/.test(path) ||
    /\/token\/?$/.test(path)
  );
}

export async function ensureRefreshed(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise;
  }
  refreshPromise = (async () => {
    let hasRefresh: boolean | null = null;
    try {
      const { data } = await nextAuthApi.get<{ hasRefreshToken?: boolean }>('/api/auth/session', {
        skipAuthRetry: true,
      });
      hasRefresh = Boolean(data?.hasRefreshToken);
    } catch {
      hasRefresh = null;
    }
    if (hasRefresh === false) {
      await handleAuthFailureRedirect();
      throw new Error('No refresh token');
    }
    await nextAuthApi.post('/api/auth/refresh', {});
    authFailureHandled = false;
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function handleAuthFailureRedirect(): Promise<void> {
  if (authFailureHandled) return;
  authFailureHandled = true;
  const { user, authChecked } = useAuthStore.getState();
  try {
    await nextAuthApi.post('/api/auth/logout', {}, { skipAuthRetry: true });
  } catch {
    // Best effort server cleanup.
  }
  await useAuthStore.getState().clearAuth({ callLogout: false });
  // Guests browsing public pages: optional APIs (e.g. upvote) may 401 — do not hijack to /login.
  if (typeof window !== 'undefined' && window.location.pathname !== '/login' && authChecked && user !== null) {
    window.location.replace('/login');
  }
}

function attachAuthRefreshInterceptor(client: typeof authApi): void {
  client.interceptors.response.use(
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
        return client(original);
      } catch {
        await handleAuthFailureRedirect();
        return Promise.reject(error);
      }
    }
  );
}

attachAuthRefreshInterceptor(authApi);
attachAuthRefreshInterceptor(nextAuthApi);

export interface MeProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  is_verified_senior: boolean;
}

/** Verified NIAT profile details: campus, LinkedIn, year joined. */
export interface FoundingEditorProfile {
  student_id_number?: string;
  bio?: string;
  id_card_file?: string | null;
  profile_picture?: string | null;
  linkedin_profile: string;
  campus_id: string | null;
  campus_name: string;
  year_joined: number | null;
}

export async function fetchMe(): Promise<MeProfile | null> {
  try {
    await ensureRefreshed().catch(() => {});
    const { data } = await nextAuthApi.get<MeProfile>('/api/auth/account-me', { skipAuthRetry: true });
    return data;
  } catch {
    return null;
  }
}

export async function updateMeProfile(payload: Partial<Pick<MeProfile, 'username' | 'email'>>): Promise<MeProfile> {
  const { data } = await nextAuthApi.patch<MeProfile>('/api/proxy/auth/me', payload);
  return data;
}

/** Get verified NIAT profile (college details). 403 if role lacks access. */
export async function fetchFoundingEditorProfile(): Promise<FoundingEditorProfile | null> {
  try {
    const { data } = await nextAuthApi.get<FoundingEditorProfile>('/api/auth/profile');
    return data;
  } catch {
    return null;
  }
}

/** True if verified NIAT profile has required fields (campus, LinkedIn, year joined). */
export function isOnboardingComplete(profile: FoundingEditorProfile | null): boolean {
  if (!profile) return false;
  return (
    profile.campus_id != null &&
    !!profile.linkedin_profile?.trim() &&
    profile.year_joined != null
  );
}

/** Update verified NIAT profile (college details). */
export async function updateFoundingEditorProfile(
  payload: Partial<FoundingEditorProfile> | FormData
): Promise<FoundingEditorProfile> {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  const { data } = await nextAuthApi.patch<FoundingEditorProfile>(
    '/api/proxy/auth/profile',
    payload,
    isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : undefined
  );
  return data;
}

export async function completeOnboarding(): Promise<{ is_onboarded: boolean }> {
  const { data } = await nextAuthApi.post<{ is_onboarded: boolean }>(
    '/api/proxy/auth/onboarding/complete',
    {}
  );
  return data;
}

/** Request OTP by phone. for: "register" | "login" */
export async function requestOtpByPhone(
  phone: string,
  opts?: { for?: 'register' | 'login' }
): Promise<{ message: string }> {
  const body: { phone_number: string; for?: string } = { phone_number: phone.trim() };
  if (opts?.for) body.for = opts.for;
  const { data } = await api.post<{ message: string }>('/verification/otp/request/', body);
  return data;
}

/** Verify OTP by phone. */
export async function verifyOtpByPhone(phone: string, code: string): Promise<{ verified: boolean }> {
  const { data } = await api.post<{ verified: boolean }>('/verification/otp/verify/', {
    phone_number: phone.trim(),
    code: code.trim(),
  });
  return data;
}

/** Log in with phone + OTP. Returns JWT; store with setTokens. */
export async function loginByPhoneOtp(
  phone: string,
  code: string
): Promise<{ access: string }> {
  const { data } = await nextAuthApi.post<{ access: string }>('/api/auth/login-phone', {
    phone_number: phone.trim(),
    code: code.trim(),
  });
  return data;
}

/** Log in with mobile number + password. Returns JWT; store with setTokens. */
export async function loginByPhonePassword(
  phone: string,
  password: string
): Promise<{ access: string }> {
  const { data } = await nextAuthApi.post<{ access: string }>('/api/auth/login', {
    phone_number: phone.trim(),
    password,
  });
  return data;
}

/** Register (NIAT Insider: source=niatverse → role niat_student). */
export async function registerNiatverse(payload: {
  username: string;
  phone: string;
  password: string;
}): Promise<{ id: string; username: string; email: string; phone: string }> {
  const { data } = await api.post<{ id: string; username: string; email: string; phone: string }>(
    '/auth/register/',
    {
      username: payload.username.trim(),
      phone_number: payload.phone.trim(),
      password: payload.password,
      source: 'niatverse',
    }
  );
  return data;
}

/** Log in with username + password (e.g. after register). Returns JWT. */
export async function loginByUsernamePassword(
  username: string,
  password: string
): Promise<{ access: string }> {
  const { data } = await nextAuthApi.post<{ access: string }>('/api/auth/token', {
    username: username.trim(),
    password,
  });
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
  const { data } = await nextAuthApi.get<{ available: boolean }>('/api/auth/username-available', {
    params: { username: username.trim() },
  });
  return data;
}

export async function requestChangePhoneOtp(phone_number: string): Promise<{ detail: string }> {
  const { data } = await nextAuthApi.post<{ detail: string }>(
    '/api/proxy/auth/change-phone/request-otp',
    { phone_number: phone_number.trim() }
  );
  return data;
}

export async function confirmChangePhone(phone_number: string, code: string): Promise<{ detail: string }> {
  const { data } = await nextAuthApi.post<{ detail: string }>(
    '/api/proxy/auth/change-phone/confirm',
    {
      phone_number: phone_number.trim(),
      code: code.trim(),
    }
  );
  return data;
}

export async function changePassword(payload: {
  current_password: string;
  new_password: string;
}): Promise<{ detail: string }> {
  const { data } = await nextAuthApi.post<{ detail: string }>(
    '/api/proxy/auth/change-password',
    payload
  );
  return data;
}

export async function logout(): Promise<void> {
  try {
    await nextAuthApi.post('/api/auth/logout', {}, { skipAuthRetry: true });
  } finally {
    authFailureHandled = false;
    await useAuthStore.getState().clearAuth({ callLogout: false });
  }
}
