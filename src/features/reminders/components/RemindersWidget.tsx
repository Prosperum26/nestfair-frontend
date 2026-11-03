import { ArrowRight, Bell, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { CardEmpty, DashCard } from '@/features/dashboard/DashCard.tsx';
import { cn } from '@/lib/cn.ts';
import { nextReminders } from '../format.ts';
import { useReminders } from '../hooks.ts';
import { ReminderRow } from './ReminderRow.tsx';
import { RemindersSkeleton } from './RemindersPanel.tsx';

const linkCls = 'text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]';

/**
 * Thẻ "Nhắc nhở" cột phải màn Tổng quan (ảnh 05): 3 nhắc sắp tới (giờ mono + tiêu đề + chip nguồn,
 * không có nút sửa / xóa) + link "Mở trợ lý". Đủ trạng thái loading / lỗi (thử lại) / trống.
 */
export function RemindersWidget({ className }: { className?: string }) {
  const reminders = useReminders('upcoming');
  const rows = reminders.data ? nextReminders(reminders.data, 3) : [];

  return (
    <DashCard
      className={className}
      overline="3 nhắc gần nhất"
      title="Nhắc nhở"
      aside={
        <Link to="/assistant" className={cn(linkCls, 'flex items-center gap-1')}>
          Mở trợ lý <ArrowRight className="size-4" aria-hidden />
        </Link>
      }
    >
      {reminders.isPending ? (
        <RemindersSkeleton />
      ) : reminders.isError ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-btn border border-dashed border-line-2 px-4 py-8 text-center">
          <span className="text-tom [&_svg]:size-6" aria-hidden>
            <TriangleAlert />
          </span>
          <p className="max-w-[320px] text-sm text-ink-2">Chưa tải được nhắc nhở.</p>
          <Button variant="secondary" size="sm" onClick={() => void reminders.refetch()}>
            Thử lại
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <CardEmpty icon={<Bell />}>Nhờ Trợ lý tạo nhắc nhở, 3 nhắc gần nhất sẽ hiện ở đây.</CardEmpty>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((reminder) => (
            <ReminderRow key={reminder.id} reminder={reminder} className="py-3" />
          ))}
        </ul>
      )}
    </DashCard>
  );
}
