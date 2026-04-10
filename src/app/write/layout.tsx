import RequireSessionServer from '@/components/RequireSessionServer';

export default function WriteLayout({ children }: { children: React.ReactNode }) {
  return <RequireSessionServer fallbackFrom="/write">{children}</RequireSessionServer>;
}
