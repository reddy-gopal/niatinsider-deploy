import axios from 'axios';

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

/** Axios instance for auth endpoints; retries with refresh token on 401. */
const authApi = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('niat_access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

authApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('niat_refresh');
      if (refresh) {
        try {
          const { data } = await axios.post<{ access: string }>(`${BASE}/api/token/refresh/`, { refresh });
          localStorage.setItem('niat_access', data.access);
          if (original.headers) original.headers.Authorization = `Bearer ${data.access}`;
          return authApi(original);
        } catch {
          localStorage.removeItem('niat_access');
          localStorage.removeItem('niat_refresh');
        }
      }
    }
    return Promise.reject(error);
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
  if (!localStorage.getItem('niat_access')) return null;
  try {
    const { data } = await authApi.get<MeProfile>('/auth/me/');
    return data;
  } catch {
    return null;
  }
}

/** Get Founding Editor profile (college details). 403 if user is not founding_editor. */
export async function fetchFoundingEditorProfile(): Promise<FoundingEditorProfile | null> {
  if (!localStorage.getItem('niat_access')) return null;
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
): Promise<{ access: string; refresh: string }> {
  const { data } = await api.post<{ access: string; refresh: string }>('/auth/login/phone/', {
    phone,
    code,
  });
  return data;
}

/** Log in with mobile number + password. Returns JWT; store with setTokens. */
export async function loginByPhonePassword(
  phone: string,
  password: string
): Promise<{ access: string; refresh: string }> {
  const { data } = await api.post<{ access: string; refresh: string }>('/auth/login/phone-password/', {
    phone: phone.trim(),
    password,
  });
  return data;
}

/** Register (NIAT Insider: source=niatverse → role founding_editor). */
export async function registerNiatverse(payload: {
  username: string;
  phone: string;
  email?: string;
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
): Promise<{ access: string; refresh: string }> {
  const { data } = await axios.post<{ access: string; refresh: string }>(`${BASE}/api/token/`, {
    username,
    password,
  });
  return data;
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem('niat_access', access);
  localStorage.setItem('niat_refresh', refresh);
}

export function clearTokens(): void {
  localStorage.removeItem('niat_access');
  localStorage.removeItem('niat_refresh');
}
