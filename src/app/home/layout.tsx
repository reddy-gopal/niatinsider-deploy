import RequireSessionServer from '@/components/RequireSessionServer';
import RequireOnboarding from '@/components/RequireOnboarding';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireSessionServer fallbackFrom="/home">
      <RequireOnboarding>
        {children}
      </RequireOnboarding>
    </RequireSessionServer>
  );
}
