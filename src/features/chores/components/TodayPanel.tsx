import { Brush, Clock } from 'lucide-react';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { canCheckin } from '../permissions.ts';
import { statusChip } from '../status.ts';
import type { Assignment } from '../types.ts';
import { myShiftsToday } from '../grouping.ts';
import { dueTimeLabel } from '../week.ts';
import { AssignmentCard } from './AssignmentCard.tsx';
import { CheckinForm } from './CheckinModal.tsx';

/**
 * "Việc của bạn hôm nay" (preview 06): ca của mình trong ngày, nộp ảnh ngay tại đây, không cần mở hộp thoại.
 * Ca đã nộp / hoàn thành / quá hạn hiện thẻ trạng thái để theo dõi.
 */
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
  const mine = myShiftsToday(assignments, meUserId, now);
  return (
    <section aria-label="Việc của bạn hôm nay" className="rounded-card border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Việc của bạn hôm nay</h2>
        <span className="font-mono text-cap text-ink-2">{mine.length}</span>
      </div>
      {mine.length === 0 ? (
        <p className="rounded-btn-sm border border-dashed border-line-2 px-4 py-6 text-center text-sm text-ink-2">Hôm nay bạn không có ca nào. Nghỉ ngơi nhé.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {mine.map((a) => {
            const open = canCheckin(a, meUserId, now, graceHours);
            if (!open) return <AssignmentCard key={a.id} assignment={a} isMine />;
            const chip = statusChip(a.status);
            return (
              <article key={a.id} className="rounded-card border border-line-2 p-4">
                <div className="flex items-start gap-3">
                  <IconTile icon={<Brush />} tone={avatarToneFor(a.choreId)} size={40} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-h4 text-ink">{a.choreTitle}</h3>
                    <p className="mt-0.5 text-cap text-ink-2">
                      Độ nặng <span className="font-mono">{a.weight}</span> · {chip.label}
                    </p>
                  </div>
                  <Chip tone="yellow" size="sm" icon={<Clock />}>
                    Trước <span className="font-mono">{dueTimeLabel(a.dueAt)}</span>
                  </Chip>
                </div>
                <div className="mt-4">
                  <CheckinForm assignment={a} houseId={houseId} meUserId={meUserId} onClose={() => undefined} inline />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
