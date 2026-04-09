"use client";

interface BadgeShareButtonProps {
  badgePageUrl: string;
  caption: string;
}

export default function BadgeShareButton({ badgePageUrl, caption }: BadgeShareButtonProps) {
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(caption);
    } catch {
      // Best effort only.
    }
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(badgePageUrl)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="relative inline-flex items-center justify-center gap-3 rounded-full bg-[#0a66c2]/10 border border-[#0a66c2]/50 px-8 py-3.5 text-base font-semibold text-[#66b2ff] backdrop-blur-sm transition-all duration-300 hover:bg-[#0a66c2]/20 hover:border-[#0a66c2] hover:text-white hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(10,102,194,0.4)]"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
      Share on LinkedIn
    </button>
  );
}
