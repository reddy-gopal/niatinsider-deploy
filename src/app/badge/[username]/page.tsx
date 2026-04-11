import type { Metadata } from "next";
import { API_BASE } from "@/lib/apiBase";
import { publicBadgePageUrl, PUBLIC_SITE_URL } from "@/lib/publicSiteUrl";
import BadgeShareButton from "./BadgeShareButton";
import NiatBadgeCard from "@/components/NiatBadgeCard";

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

async function getBadge(username: string): Promise<BadgePayload | null> {
  const res = await fetch(`${API_BASE}/api/profiles/badge/${encodeURIComponent(username)}/`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as BadgePayload;
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params;
  const badge = await getBadge(username);
  const title = badge ? `${badge.username} — Verified NIAT Student` : "Verified NIAT Student Badge";
  const pageUrl = badge ? publicBadgePageUrl(badge.username) : `${PUBLIC_SITE_URL}/badge/${encodeURIComponent(username)}`;
  
  // TODO: If we later want a real dynamic OG image for LinkedIn unfurl previews, 
  // we can use Vercel's @vercel/og with Satori to server-render NiatBadgeCard 
  // as a PNG at /api/og/badge/[username].
  const imageUrl = "/niat-og-fallback.png";

  return {
    title,
    openGraph: {
      title,
      url: pageUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: [imageUrl],
    },
  };
}

export default async function BadgePage(
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const badge = await getBadge(username);

  if (!badge) {
    return (
      <div className="min-h-screen bg-[#f4f4f5] flex items-center justify-center px-4">
        <p className="text-sm text-gray-500">Badge not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f5] text-black flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{badge.username}</h1>
        <p className="mt-2 text-sm md:text-base text-gray-600">Verified NIAT Student identity card</p>
      </div>

      <div className="my-4">
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
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        <BadgeShareButton badgePageUrl={publicBadgePageUrl(badge.username)} caption={badge.caption} />
        <p className="text-xs text-gray-500">This badge is publicly shareable</p>
      </div>
    </div>
  );
}
