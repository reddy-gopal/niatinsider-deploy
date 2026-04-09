import { create } from 'zustand';
import { ensureRefreshed, nextAuthApi } from '@/lib/authApi';

type AuthUser = { id: string; username: string; phone: string } | null;
export type AuthRole =
  | 'intermediate_student'
  | 'niat_student'
  | 'verified_niat_student'
  | 'moderator'
  | 'admin'
  | null;
export type NiatStatus = 'pending' | 'approved' | 'rejected' | null;
type AuthBadge = { type: string; awarded_at: string } | null;

export const AUTH_ROLES = {
  intermediate: 'intermediate_student',
  niat: 'niat_student',
  verifiedNiat: 'verified_niat_student',
  moderator: 'moderator',
  admin: 'admin',
} as const;

export const WRITE_ENABLED_ROLES: ReadonlyArray<Exclude<AuthRole, 'intermediate_student' | 'niat_student' | null>> = [
  AUTH_ROLES.verifiedNiat,
  AUTH_ROLES.moderator,
  AUTH_ROLES.admin,
];

interface ProfilesMeResponse {
  user?: { id?: string; username?: string; phone?: string; phone_number?: string } | null;
  role?: AuthRole;
  is_onboarded?: boolean;
  profile?: {
    status?: NiatStatus;
    campus_id?: string | number | null;
    campus?: { id?: string | number | null } | null;
  } | null;
  badge?: AuthBadge;
}

export interface AuthState {
  user: AuthUser;
  role: AuthRole;
  isOnboarded: boolean;
  niatStatus: NiatStatus;
  campusId: string | null;
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
  campusId: null,
  badge: null,
  authChecked: false,
  setAuth: (data) => set((state) => ({ ...state, ...data })),
  clearAuth: async (opts) => {
    const shouldCallLogout = opts?.callLogout ?? true;
    if (shouldCallLogout && !logoutInFlight) {
      logoutInFlight = true;
      try {
        await nextAuthApi.post('/api/auth/logout', {}, { skipAuthRetry: true });
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
      campusId: null,
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
        const { data } = await nextAuthApi.get<ProfilesMeResponse>('/api/auth/me', {
          skipAuthRetry: true,
        });
        const role = data?.role ?? null;
        const profile = data?.profile ?? null;
        const campusId =
          profile?.campus?.id != null
            ? String(profile.campus.id)
            : profile?.campus_id != null
              ? String(profile.campus_id)
              : null;
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
          campusId,
          badge: data?.badge ?? null,
          authChecked: true,
        });
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        void status;
        set({
          user: null,
          role: null,
          isOnboarded: false,
          niatStatus: null,
          campusId: null,
          badge: null,
          authChecked: true,
        });
      } finally {
        bootstrapInFlight = null;
      }
    })();

    return bootstrapInFlight;
  },
}));

