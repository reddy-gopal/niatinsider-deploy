"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthBootstrapper() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);

  // Always revalidate auth on mount so stale in-memory auth state
  // cannot render logged-in UI for anonymous users.
  useEffect(() => {
    void bootstrapAuth({ force: true });
  }, [bootstrapAuth]);

  // Handle bfcache restore (back/forward navigation).
  // Browser restores the page from memory — React does not remount
  // so the useEffect above does not re-run. pageshow with
  // event.persisted catches this case.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void bootstrapAuth({ force: true });
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [bootstrapAuth]);

  // Renders nothing — purely behavioral
  return null;
}
