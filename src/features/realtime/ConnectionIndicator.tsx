import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn.ts';
import { type ConnectionStatus, STATUS_LABEL } from './connection.ts';
import { useSocket } from './context.ts';

const DOT: Record<ConnectionStatus, string> = {
  connected: 'bg-mint-v',
  reconnecting: 'bg-hl',
  offline: 'bg-tom-v',
};

/** Chấm trạng thái kết nối realtime ở header: mint "Trực tuyến", hl "Đang kết nối lại…", tom "Mất kết nối". */
export function ConnectionDot({ className }: { className?: string }) {
  const { status } = useSocket();
  const label = STATUS_LABEL[status];
  return (
    <span className={cn('flex shrink-0 items-center gap-1.5', className)} title={label} role="status" aria-label={label}>
      <span className={cn('size-2 rounded-full ring-2 ring-surface', DOT[status])} aria-hidden />
      <span className="hidden text-cap text-ink-2 xl:inline">{label}</span>
    </span>
  );
}

/** Banner dưới header khi mất kết nối > 5 giây. Không có lỗi đỏ: app tự nối lại. */
export function ReconnectBanner() {
  const { showBanner, status } = useSocket();
  if (!showBanner) return null;
  return (
    <div role="status" aria-live="polite" className="sticky top-16 z-30 border-b border-line bg-hl-soft lg:top-[72px]">
      <p className="mx-auto flex max-w-page items-center gap-2 px-4 py-2 text-sm text-hl-ink lg:px-6 xl:px-0">
        <WifiOff className="size-4 shrink-0" aria-hidden />
        {status === 'offline'
          ? 'Mất kết nối. Dữ liệu sẽ tự cập nhật khi có mạng lại.'
          : 'Đang kết nối lại… Dữ liệu sẽ tự cập nhật khi có mạng lại.'}
      </p>
    </div>
  );
}
