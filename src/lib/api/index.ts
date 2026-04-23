import { nextAuthApi } from "@/lib/authApi";

export interface OnboardingStatusResponse {
  review_submitted: boolean;
}

export interface OnboardingReviewPayload {
  teaching_quality: number;
  faculty_support_text: string;
  faculty_support_choice: string;
  projects_quality: number;
  best_project_or_skill: string;
  learning_balance_choice: string;
  placement_support: number;
  job_ready_text: string;
  placement_reality_choice: string;
  overall_satisfaction: number;
  one_line_experience: string;
  experience_feel_choice: string;
  recommendation_score: number;
  who_should_join_text: string;
  final_recommendation_choice: string;
  linkedin_profile_url: string;
}

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const { data } = await nextAuthApi.get<OnboardingStatusResponse>("/api/niat/review/status/");
  return data;
}

export async function submitOnboardingReview(
  payload: OnboardingReviewPayload
): Promise<{ review_submitted: true }> {
  try {
    await nextAuthApi.post<{ status: string }>("/api/niat/review/submit/", payload);
    return { review_submitted: true };
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } })?.response?.status;
    if (status === 400) {
      throw new Error("Review already submitted");
    }
    throw err;
  }
}
