import { cn } from '@/lib/cn.ts';

/** Khối xám nhấp nháy cho trạng thái đang tải. */
export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('block animate-pulse rounded-btn-sm bg-paper-2', className)} aria-hidden />;
}
