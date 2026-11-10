import { Pencil, Trash2 } from 'lucide-react';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { cn } from '@/lib/cn.ts';
import { reminderWhen, sourceLabel } from '../format.ts';
import type { ReminderDto, ReminderSource } from '../types.ts';

/** Tone chip nguồn theo ảnh 19: "Từ trợ lý" vàng (hl-soft), "Hệ thống" xám (paper-2); "Của tôi" viền line-2. */
const SOURCE_CHIP_TONE: Record<ReminderSource, 'yellow' | 'neutral' | 'outline'> = {
  ASSISTANT: 'yellow',
  SYSTEM: 'neutral',
  USER: 'outline',
};

/** Vùng chạm 44px bọc ô hiển thị 32px: thiết kế vẽ ô 32 nhưng tay bấm phải thoải mái (Design.md mục 6). */
const actionBtnCls =
  'group flex size-11 shrink-0 items-center justify-center rounded-btn focus-visible:outline-none focus-visible:shadow-focus';
const actionBoxCls =
  'flex size-8 items-center justify-center rounded-btn bg-paper transition-colors group-hover:bg-paper-2 [&_svg]:size-4';

/**
 * Một dòng nhắc (ảnh 19): ô giờ mono — nền hl-soft khi nhắc "Hôm nay", paper-2 các ngày khác —
 * + tiêu đề + chip nguồn. Nút sửa / xóa chỉ hiện khi chưa gửi (sentAt = null); nhắc Hệ thống
 * không có nút xóa (D12: API trả REMINDER_NOT_DELETABLE). Widget Tổng quan dùng không truyền
 * onEdit / onDelete nên chỉ còn phần hiển thị (ảnh 05).
 */
export function ReminderRow({
  reminder,
  now = new Date(),
  onEdit,
  onDelete,
  className,
}: {
  reminder: ReminderDto;
  now?: Date;
  onEdit?: (reminder: ReminderDto) => void;
  onDelete?: (reminder: ReminderDto) => void;
  /** Padding dòng do nơi dùng tự quyết (panel py-4, widget py-3). */
  className?: string;
}) {
  const { time, day } = reminderWhen(reminder.remindAt, now);
  const canEdit = reminder.sentAt === null && !!onEdit;
  const canDelete = reminder.sentAt === null && reminder.source !== 'SYSTEM' && !!onDelete;
  return (
    <AnimatedItem as="li" className={cn('flex items-center gap-3', className)}>
      <span
        className={cn(
          'flex h-[52px] w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-btn-sm',
          day === 'Hôm nay' ? 'bg-hl-soft' : 'bg-paper-2',
        )}
      >
        <span className="font-mono text-mm text-ink">{time}</span>
        <span className="text-cap text-ink-2">{day}</span>
      </span>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium break-words text-ink">{reminder.title}</p>
        <Chip tone={SOURCE_CHIP_TONE[reminder.source]} size="sm" className="mt-1">
          {sourceLabel(reminder.source)}
        </Chip>
      </div>
      {(canEdit || canDelete) && (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {canEdit && onEdit && (
            <button type="button" aria-label={`Sửa nhắc "${reminder.title}"`} onClick={() => onEdit(reminder)} className={actionBtnCls}>
              <span className={cn(actionBoxCls, 'text-ink')}>
                <Pencil aria-hidden />
              </span>
            </button>
          )}
          {canDelete && onDelete && (
            <button type="button" aria-label={`Xóa nhắc "${reminder.title}"`} onClick={() => onDelete(reminder)} className={actionBtnCls}>
              <span className={cn(actionBoxCls, 'text-tom')}>
                <Trash2 aria-hidden />
              </span>
            </button>
          )}
        </div>
      )}
    </AnimatedItem>
  );
}
