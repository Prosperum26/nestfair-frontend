import { Eye, ListChecks, RotateCw } from 'lucide-react';
import { Link } from 'react-router';
import { Chip } from '@/components/ui/Chip.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { CardEmpty, DashCard } from '@/features/dashboard/DashCard.tsx';
import { formatDayShort } from '@/lib/date.ts';
import { myShiftsToday, waitingForReview } from '../grouping.ts';
import { useChoreSettings, useTodayAssignments } from '../hooks.ts';
import { useChoresRealtime } from '../realtime.ts';
import { TodayList } from './TodayPanel.tsx';

const linkCls = 'text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]';

/**
 * Thẻ "Việc hôm nay" ở Tổng quan: ca của mình hôm nay (gồm ca vòng quay còn mở), nộp ảnh ngay tại thẻ;
 * kèm lối tắt tới các ca đang chờ mình duyệt.
 */
export function TodayCard({ houseId, meUserId, className }: { houseId: string | undefined; meUserId: string | undefined; className?: string }) {
  const now = new Date();
  const today = useTodayAssignments(houseId, now);
  const settings = useChoreSettings(houseId);
  useChoresRealtime(houseId, false);
  const graceHours = settings.data?.choreGraceHours ?? 3;
  const mine = myShiftsToday(today.assignments, meUserId, now, graceHours);
  const waiting = waitingForReview(today.assignments, meUserId).length;

  let body;
  if (today.status === 'pending' || !houseId) {
    body = (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải việc hôm nay">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    );
  } else if (today.status === 'error') {
    body = (
      <CardEmpty icon={<ListChecks />}>
        Không tải được việc hôm nay.{' '}
        <button type="button" onClick={() => void today.refetch()} className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-2">
          <RotateCw className="size-3.5" aria-hidden />
          Thử lại
        </button>
      </CardEmpty>
    );
  } else {
    body = <TodayList mine={mine} houseId={houseId} meUserId={meUserId} graceHours={graceHours} now={now} />;
  }

  return (
    <DashCard
      className={className}
      overline={formatDayShort(now)}
      title="Việc hôm nay"
      aside={<Chip tone="outline">{mine.length} việc</Chip>}
    >
      {body}
      {waiting > 0 && (
        <p className="mt-4 flex items-center gap-2 border-t border-line pt-4 text-sm text-ink-2">
          <Eye className="size-4 shrink-0" aria-hidden />
          <span className="flex-1">{waiting} ca đang chờ bạn duyệt.</span>
          <Link to="/chores" className={linkCls}>
            Xem và duyệt
          </Link>
        </p>
      )}
    </DashCard>
  );
}
