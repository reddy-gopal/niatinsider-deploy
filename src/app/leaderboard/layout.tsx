import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NIAT Insider Leaderboard | Top Student Writers by Campus',
  description:
    'Explore the NIAT Insider leaderboard to see top student writers by campus, ranked by article views and contribution impact across NIAT communities.',
  keywords: [
    'niat insider leaderboard',
    'niat top writers',
    'niat student contributors',
    'niat campus leaderboard',
    'niat article rankings',
    'niat insider top contributors',
  ],
  openGraph: {
    title: 'NIAT Insider Leaderboard | Top Student Writers by Campus',
    description:
      'Explore the NIAT Insider leaderboard to see top student writers by campus, ranked by article views and contribution impact across NIAT communities.',
    url: 'https://www.niatinsider.com/leaderboard',
    type: 'website',
  },
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

