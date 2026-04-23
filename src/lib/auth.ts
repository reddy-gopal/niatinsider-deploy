import { useAuthStore } from "@/store/authStore";

export function isAuthenticated(): boolean {
  const state = useAuthStore.getState();
  // During bootstrap, avoid false negatives that would cause redirect flicker.
  if (!state.authChecked) return true;
  return state.user !== null;
}
