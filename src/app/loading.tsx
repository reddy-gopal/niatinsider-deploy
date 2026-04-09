import { Spinner } from '@/components/ui/spinner';

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/75 backdrop-blur-[1px]">
      <Spinner size="lg" />
    </div>
  );
}
