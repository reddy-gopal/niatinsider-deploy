"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function AuthBootstrapper() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const setAuth = useAuthStore((state) => state.setAuth);

  const bootstrapIfSessionExists = async () => {
    try {
      // access_token/refresh_token are HttpOnly; JS cannot inspect them with document.cookie.
      // Ask the server for a lightweight session hint before running full bootstrap.
      const res = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const data = (await res.json().catch(() => ({}))) as { hasRefreshToken?: boolean };
      if (!data?.hasRefreshToken) {
        setAuth({ authChecked: true });
        return;
      }
    } catch {
      // If the hint endpoint fails, fall back to the previous behavior.
    }
    await bootstrapAuth({ force: true });
  };

  // Always revalidate auth on mount so stale in-memory auth state
  // cannot render logged-in UI for anonymous users.
  useEffect(() => {
    void bootstrapIfSessionExists();
  }, [bootstrapAuth, setAuth]);

  // Handle bfcache restore (back/forward navigation).
  // Browser restores the page from memory — React does not remount
  // so the useEffect above does not re-run. pageshow with
  // event.persisted catches this case.
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        void bootstrapIfSessionExists();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [bootstrapAuth, setAuth]);

  // Renders nothing — purely behavioral
  return null;
}
