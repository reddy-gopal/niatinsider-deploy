import RequireSessionServer from '@/components/RequireSessionServer';
import RequireOnboarding from '@/components/RequireOnboarding';
import NiatReviewGuard from '@/components/NiatReviewGuard';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSessionServer fallbackFrom="/home">
      <RequireOnboarding>
        <NiatReviewGuard>{children}</NiatReviewGuard>
      </RequireOnboarding>
    </RequireSessionServer>
  );
}
