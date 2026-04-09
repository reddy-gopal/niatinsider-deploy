import RequireOnboarding from '@/components/RequireOnboarding';

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireOnboarding>{children}</RequireOnboarding>;
}
