import { LoaderCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo.tsx';

/** Màn chờ toàn trang (khôi phục phiên, hoàn tất đăng nhập Google). */
export function SessionLoader({ label = 'Đang tải phiên đăng nhập' }: { label?: string }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-paper" role="status">
      <Logo />
      <LoaderCircle className="size-5 animate-spin text-ink-2" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
