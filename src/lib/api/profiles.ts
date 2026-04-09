import { nextAuthApi } from '@/lib/authApi';

export type PlatformRole =
  | 'intermediate_student'
  | 'niat_student'
  | 'verified_niat_student'
  | 'moderator'
  | 'admin';

export type NiatStatus = 'pending' | 'approved' | 'rejected';

export interface BadgeData {
  type: string;
  awarded_at: string;
}

export interface IntermediateProfile {
  id: number;
  college_name: string;
  branch: "MPC" | "BIPC" | "OTHERS";
  branch_other: string;
  created_at: string;
  updated_at: string;
}

export interface NiatProfile {
  id: number;
  student_id_number: string;
  campus_name: string;
  id_card_file: string;
  status: NiatStatus;
  reviewed_by: string | null;
  reviewed_by_username: string | null;
  reviewed_at: string | null;
  rejection_reason: string;
  created_at: string;
  updated_at: string;
}

export interface FoundingProfile {
  id: number;
  bio: string;
  badge_awarded_at: string;
  profile_picture: string;
  linkedin_profile: string;
  campus_id: string | null;
  campus_name: string;
  year_joined: number | null;
}

export interface MyProfileResponse {
  role: PlatformRole;
  profile: IntermediateProfile | NiatProfile | FoundingProfile | null;
  badge: BadgeData | null;
}

export interface OnboardingRoleResponse {
  role: 'intermediate_student' | 'niat_student';
}

export interface OnboardingCompleteResponse {
  is_onboarded: boolean;
}

export async function getMyProfile(): Promise<MyProfileResponse> {
  const { data } = await nextAuthApi.get<MyProfileResponse>('/api/auth/me');
  return data;
}

export async function upsertIntermediateProfile(data: {
  college_name: string;
  branch: "MPC" | "BIPC" | "OTHERS";
  branch_other?: string;
}): Promise<IntermediateProfile> {
  const response = await nextAuthApi.post<IntermediateProfile>('/api/proxy/profiles/intermediate', data);
  return response.data;
}

export async function upsertNiatProfile(data: FormData): Promise<NiatProfile> {
  const response = await nextAuthApi.post<NiatProfile>('/api/proxy/profiles/niat', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function setOnboardingRole(
  role: 'intermediate_student' | 'niat_student'
): Promise<OnboardingRoleResponse> {
  const { data } = await nextAuthApi.post<OnboardingRoleResponse>(
    '/api/proxy/auth/onboarding/role',
    { role }
  );
  return data;
}

export async function completeOnboarding(): Promise<OnboardingCompleteResponse> {
  const { data } = await nextAuthApi.post<OnboardingCompleteResponse>(
    '/api/proxy/auth/onboarding/complete',
    { is_onboarded: true }
  );
  return data;
}

