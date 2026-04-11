"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { API_BASE } from "@/lib/apiBase";
import { publicBadgePageUrl } from "@/lib/publicSiteUrl";
import NiatBadgeCard from "./NiatBadgeCard";
import BadgeShareButton from "@/app/badge/[username]/BadgeShareButton";

type BadgePayload = {
  username: string;
  name: string;
  role: string;
  campus: string;
  program: string;
  batch: string;
  studentId: string;
  credentialId: string;
  issuedDate: string;
  profilePictureUrl: string | null;
  awarded_at: string;
  badge_page_url: string | null;
  caption: string;
};

export default function NiatBadgeModal({
  username,
  onClose,
}: {
  username: string;
  onClose: () => void;
}) {
  const [badge, setBadge] = useState<BadgePayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/profiles/badge/${encodeURIComponent(username)}/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setBadge(data);
        setLoading(false);
      })
      .catch(() => {
        setBadge(null);
        setLoading(false);
      });
      
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [username]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl relative flex flex-col items-center justify-center pt-10 pb-20">
        {/* Animated Card Container */}
        <div className="relative z-10 w-full flex justify-center animate-[popIn_0.4s_ease-out_forwards] scale-[0.98] md:scale-100 origin-center">
          {loading ? (
            <div className="flex justify-center w-full max-w-[660px] min-h-[300px] border border-white/10 bg-black/40 rounded-2xl items-center">
              <div className="animate-spin rounded-full border-2 border-white/20 size-12 border-t-[#C9A227]" />
            </div>
          ) : !badge ? (
            <div className="flex justify-center w-full max-w-[660px] min-h-[300px] border border-white/10 bg-black/40 rounded-2xl items-center">
              <p className="text-gray-400">Badge not found.</p>
            </div>
          ) : (
            <NiatBadgeCard
              name={badge.name}
              role={badge.role}
              campus={badge.campus}
              program={badge.program}
              batch={badge.batch}
              studentId={badge.studentId}
              credentialId={badge.credentialId}
              issuedDate={badge.issuedDate}
              profilePictureUrl={badge.profilePictureUrl || undefined}
              username={badge.username}
            />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute -top-12 md:-right-12 right-0 text-white/50 hover:text-white transition-colors bg-white/10 rounded-full p-2 backdrop-blur-md"
            aria-label="Close popup"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Bottom Actions Panel */}
        {!loading && badge && (
          <div className="animate-[fadeUp_0.5s_ease-out_0.2s_both] mt-10 md:mt-12 bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/20 w-fit max-w-[90%] md:max-w-max shadow-2xl">
            <div className="text-center sm:text-left">
              <h4 className="text-white font-semibold text-lg tracking-wide">Your Verified Identity</h4>
              <p className="text-white/70 text-sm mt-1 max-w-xs">Share your verified student credential to build your professional network.</p>
            </div>
            <div className="flex-shrink-0">
              <BadgeShareButton badgePageUrl={publicBadgePageUrl(badge.username)} caption={badge.caption} />
            </div>
          </div>
        )}

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
