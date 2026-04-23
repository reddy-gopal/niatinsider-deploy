export const FACULTY_SUPPORT_OPTIONS = [
  { value: "very_helpful", label: "Very helpful" },
  { value: "average", label: "Average" },
  { value: "not_supportive", label: "Not supportive" },
] as const;

export const LEARNING_BALANCE_OPTIONS = [
  { value: "practical_focused", label: "Practical focused" },
  { value: "balanced", label: "Balanced" },
  { value: "too_theoretical", label: "Too theoretical" },
] as const;

export const PLACEMENT_REALITY_OPTIONS = [
  { value: "very_promising", label: "Very promising" },
  { value: "decent_needs_improvement", label: "Decent, needs improvement" },
  { value: "not_as_expected", label: "Not as expected" },
] as const;

export const EXPERIENCE_FEEL_OPTIONS = [
  { value: "positive", label: "Positive" },
  { value: "mixed", label: "Mixed" },
  { value: "stressful", label: "Stressful" },
] as const;

export const FINAL_RECOMMENDATION_OPTIONS = [
  { value: "yes_definitely", label: "Yes, definitely" },
  { value: "yes_serious_students_only", label: "Yes, serious students only" },
  { value: "no_better_options", label: "No, better options elsewhere" },
] as const;

export const ONBOARDING_TEXT_MIN_LENGTH = 20;

export const LINKEDIN_PROFILE_URL_RE = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i;

export function isValidLinkedInProfileUrl(value: string): boolean {
  const trimmed = (value || "").trim();
  return trimmed.length > 0 && LINKEDIN_PROFILE_URL_RE.test(trimmed);
}
