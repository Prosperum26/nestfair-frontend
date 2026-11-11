import { ArrowLeftRight, Bell, CheckCheck, Receipt } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import type { Tone } from '@/components/ui/tones.ts';
import { activityTime } from '@/features/activity/text.ts';
import { cn } from '@/lib/cn.ts';
import { formatVnd } from '@/lib/format.ts';
import type { NotificationDto } from '../types.ts';
import { type NotificationView, notificationView } from '../view.ts';

const ICONS: Record<NotificationView['kind'], { icon: ReactNode; tone: Tone }> = {
  expense: { icon: <Receipt />, tone: 'yellow' },
  debt: { icon: <ArrowLeftRight />, tone: 'mint' },
  reminder: { icon: <Bell />, tone: 'lil' },
};

/**
 * Nội dung bảng thông báo dưới chuông: tiêu đề, danh sách (loading / trống / lỗi), nút đánh dấu đã đọc tất cả.
 * Chỉ hiển thị; dữ liệu và điều hướng do `NotificationBell` lo. Loại thông báo client chưa biết thì bỏ qua.
 */
export function NotificationPanel({
  status,
  items,
  unreadCount,
  now,
  onOpen,
  onReadAll,
  onRetry,
}: {
  status: 'loading' | 'error' | 'ready';
  items: readonly NotificationDto[];
  unreadCount: number;
  now: Date;
  onOpen: (n: NotificationDto, view: NotificationView) => void;
  onReadAll: () => void;
  onRetry: () => void;
}) {
  const rows = items.flatMap((n) => {
    const view = notificationView(n);
    return view ? [{ n, view }] : [];
  });

  return (
    <div className="flex max-h-[min(70svh,480px)] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="font-display text-ct text-ink">Thông báo</p>
        {status === 'ready' && unreadCount > 0 && rows.length > 0 && (
          <Button variant="ghost" size="sm" leftIcon={<CheckCheck />} onClick={onReadAll}>
            Đánh dấu đã đọc tất cả
          </Button>
        )}
      </div>

      {status === 'loading' && (
        <div className="flex flex-col gap-3 p-4" aria-busy="true" aria-label="Đang tải thông báo">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-9 shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-start gap-3 p-4">
          <p role="alert" className="text-sm text-ink-2">
            Không tải được thông báo. Kiểm tra mạng rồi thử lại nhé.
          </p>
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      )}

      {status === 'ready' && rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <IconTile icon={<Bell />} tone="neutral" size={40} />
          <p className="text-sm font-medium text-ink">Chưa có thông báo nào</p>
          <p className="text-cap text-ink-2">Khoản chi mới, người trả nợ cho bạn và nhắc nhở sẽ hiện ở đây.</p>
        </div>
      )}

      {status === 'ready' && rows.length > 0 && (
        <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
          {rows.map(({ n, view }) => {
            const unread = n.readAt === null;
            const { icon, tone } = ICONS[view.kind];
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => onOpen(n, view)}
                  className="flex w-full items-start gap-3 rounded-btn-sm px-2.5 py-2.5 text-left hover:bg-paper focus-visible:bg-paper focus-visible:outline-none"
                >
                  <IconTile icon={icon} tone={tone} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className={cn('line-clamp-2 text-sm break-words text-ink', unread ? 'font-semibold' : 'font-medium')}>{view.title}</span>
                    <span className="mt-0.5 block text-cap text-ink-2">
                      {view.detail}
                      {view.amount !== null && (
                        <>
                          {' · '}
                          <span className="font-mono text-ink">{formatVnd(view.amount)}</span>
                        </>
                      )}
                      {' · '}
                      <span className="font-mono">{activityTime(n.createdAt, now)}</span>
                    </span>
                  </span>
                  {unread && (
                    <span className="mt-1.5 flex shrink-0 items-center">
                      <span className="size-2 rounded-full bg-tom-v" aria-hidden />
                      <span className="sr-only">Chưa đọc</span>
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
