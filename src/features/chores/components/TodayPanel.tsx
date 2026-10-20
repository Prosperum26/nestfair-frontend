import { Brush, Clock, Dice5 } from 'lucide-react';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { canCheckin } from '../permissions.ts';
import { statusChip } from '../status.ts';
import type { Assignment } from '../types.ts';
import { myShiftsToday } from '../grouping.ts';
import { dayKeyOf, dueLabel, dueTimeLabel } from '../week.ts';
import { AssignmentCard } from './AssignmentCard.tsx';
import { CheckinForm } from './CheckinModal.tsx';

/**
 * Danh sách ca của mình hôm nay: ca còn mở thì nộp ảnh ngay tại chỗ, không cần mở hộp thoại; ca đã nộp /
 * hoàn thành / quá hạn hiện thẻ trạng thái. Gồm cả ca vòng quay còn mở từ hôm trước. Dùng ở trang Việc nhà và Tổng quan.
 */
export function TodayList({
  mine,
  houseId,
  meUserId,
  graceHours,
  now = new Date(),
}: {
  mine: Assignment[];
  houseId: string;
  meUserId: string | undefined;
  graceHours: number;
  now?: Date;
}) {
  if (mine.length === 0) {
    return (
      <p className="rounded-btn-sm border border-dashed border-line-2 px-4 py-6 text-center text-sm text-ink-2">Hôm nay bạn không có ca nào. Nghỉ ngơi nhé.</p>
    );
  }
  return (
    <div className="flex flex-col gap-4">
      {mine.map((a) => {
        const open = canCheckin(a, meUserId, now, graceHours);
        if (!open) return <AssignmentCard key={a.id} assignment={a} isMine />;
        const chip = statusChip(a.status);
        const wheel = a.source === 'WHEEL';
        return (
          <article key={a.id} className="rounded-card border border-line-2 p-4">
            <div className="flex items-start gap-3">
              <IconTile icon={wheel ? <Dice5 /> : <Brush />} tone={wheel ? 'yellow' : avatarToneFor(a.choreId)} size={40} />
              <div className="min-w-0 flex-1">
                <h3 className="text-h4 text-ink [overflow-wrap:anywhere]">{a.choreTitle}</h3>
                <p className="mt-0.5 text-cap text-ink-2">
                  {wheel ? (
                    'Việc đột xuất · vòng quay'
                  ) : (
                    <>
                      Độ nặng <span className="font-mono">{a.weight}</span>
                    </>
                  )}{' '}
                  · {chip.label}
                </p>
              </div>
              <Chip tone="yellow" size="sm" icon={<Clock />}>
                Trước{wheel && dayKeyOf(a.dueAt) !== dayKeyOf(now) ? ` ${dueLabel(a.dueAt)}` : ''} <span className="font-mono">{dueTimeLabel(a.dueAt)}</span>
              </Chip>
            </div>
            <div className="mt-4">
              <CheckinForm assignment={a} houseId={houseId} meUserId={meUserId} onClose={() => undefined} inline />
            </div>
          </article>
        );
      })}
    </div>
  );
}

/** "Việc của bạn hôm nay" (preview 06) ở trang Việc nhà. */
export function TodayPanel({
  assignments,
  houseId,
  meUserId,
  graceHours,
  now = new Date(),
}: {
  assignments: Assignment[];
  houseId: string;
  meUserId: string | undefined;
  graceHours: number;
  now?: Date;
}) {
  const mine = myShiftsToday(assignments, meUserId, now, graceHours);
  return (
    <section aria-label="Việc của bạn hôm nay" className="rounded-card border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Việc của bạn hôm nay</h2>
        <span className="font-mono text-cap text-ink-2">{mine.length}</span>
      </div>
      <TodayList mine={mine} houseId={houseId} meUserId={meUserId} graceHours={graceHours} now={now} />
    </section>
  );
}
