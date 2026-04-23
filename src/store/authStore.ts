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
  niat_review_completed?: boolean;
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
  niat_review_completed: boolean;
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

function responseStatus(err: unknown): number | undefined {
  return (err as { response?: { status?: number } })?.response?.status;
}

function isUnauthorizedStatus(status: number | undefined): boolean {
  return status === 401 || status === 403;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isOnboarded: false,
  niat_review_completed: false,
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
      niat_review_completed: false,
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
      const snapshot = useAuthStore.getState();

      async function loadMe(): Promise<ProfilesMeResponse> {
        await ensureRefreshed().catch(() => {});
        const { data } = await nextAuthApi.get<ProfilesMeResponse>('/api/auth/me', {
          skipAuthRetry: true,
        });
        return data;
      }

      function applyMeResponse(meResponse: ProfilesMeResponse) {
        const role = meResponse?.role ?? null;
        const profile = meResponse?.profile ?? null;
        const campusId =
          profile?.campus?.id != null
            ? String(profile.campus.id)
            : profile?.campus_id != null
              ? String(profile.campus_id)
              : null;
        const user = meResponse?.user
          ? {
              id: String(meResponse.user.id ?? ''),
              username: String(meResponse.user.username ?? ''),
              phone: String(meResponse.user.phone ?? meResponse.user.phone_number ?? ''),
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
          isOnboarded: Boolean(meResponse?.is_onboarded),
          niat_review_completed: meResponse.niat_review_completed ?? false,
          niatStatus: role === 'niat_student' ? (profile?.status ?? null) : null,
          campusId,
          badge: meResponse?.badge ?? null,
          authChecked: true,
        });
      }

      function clearSession() {
        set({
          user: null,
          role: null,
          isOnboarded: false,
          niat_review_completed: false,
          niatStatus: null,
          campusId: null,
          badge: null,
          authChecked: true,
        });
      }

      try {
        let data: ProfilesMeResponse;
        try {
          data = await loadMe();
        } catch (firstErr: unknown) {
          const s1 = responseStatus(firstErr);
          if (isUnauthorizedStatus(s1)) {
            clearSession();
            return;
          }
          await new Promise((r) => setTimeout(r, 400));
          data = await loadMe();
        }
        applyMeResponse(data);
      } catch (err: unknown) {
        const status = responseStatus(err);
        if (isUnauthorizedStatus(status)) {
          clearSession();
          return;
        }
        set({
          user: snapshot.user,
          role: snapshot.role,
          isOnboarded: snapshot.isOnboarded,
          niat_review_completed: snapshot.niat_review_completed,
          niatStatus: snapshot.niatStatus,
          campusId: snapshot.campusId,
          badge: snapshot.badge,
          authChecked: true,
        });
      } finally {
        bootstrapInFlight = null;
      }
    })();

    return bootstrapInFlight;
  },
}));
