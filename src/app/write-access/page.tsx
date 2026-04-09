"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const TARGET_HOME = "/home?badgePopup=1";

export default function WriteAccessEntryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const authChecked = useAuthStore((state) => state.authChecked);
  void role;

  useEffect(() => {
    if (!authChecked) return;
    if (user) {
      router.replace(TARGET_HOME);
      return;
    }
    router.replace(`/login?from=${encodeURIComponent(TARGET_HOME)}`);
  }, [authChecked, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full border-2 border-[#fbf2f3] size-10 border-t-[#991b1b]" role="status" aria-label="Loading" />
    </div>
  );
}

