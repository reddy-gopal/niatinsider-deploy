import RequireSessionServer from '@/components/RequireSessionServer';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <RequireSessionServer fallbackFrom="/settings">{children}</RequireSessionServer>;
}
