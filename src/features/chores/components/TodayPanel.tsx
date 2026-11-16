import { Brush, Clock, Dice5, HandHelping } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { canCheckin } from '../permissions.ts';
import { statusChip } from '../status.ts';
import type { Assignment } from '../types.ts';
import { messageForError } from '../errors.ts';
import { myShiftsToday, openUnclaimed } from '../grouping.ts';
import { useClaim } from '../hooks.ts';
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
          <article key={a.id} className="@container rounded-card border border-line-2 p-4">
            <div className="flex items-start gap-3">
              <IconTile icon={wheel ? <Dice5 /> : <Brush />} tone={wheel ? 'yellow' : avatarToneFor(a.choreId)} size={40} />
              {/* Thẻ hẹp (mobile, hai cột ở md): hạn chót xuống dưới tên việc để tên không bị ép thành cột chữ. */}
              <div className="flex min-w-0 flex-1 flex-col items-start gap-2 @sm:flex-row @sm:gap-3">
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

/** Phần hiển thị thuần của khối "Việc chưa có người nhận": mỗi ca một nút Nhận việc, khóa khi đang nhận một ca. */
export function UnclaimedList({ items, busyId, onClaim, now = new Date() }: { items: Assignment[]; busyId: string | null; onClaim: (a: Assignment) => void; now?: Date }) {
  if (items.length === 0) return null;
  return (
    <div className="nf-attn mt-5 rounded-card border-t border-line pt-4">
      <h3 className="font-mono text-cap uppercase text-ink-2">Việc chưa có người nhận</h3>
      <ul className="mt-3 flex flex-col gap-3">
        {items.map((a) => (
          <li key={a.id} className="@container flex flex-wrap items-center gap-3 rounded-card border border-line-2 p-3">
            <IconTile icon={<HandHelping />} tone="yellow" size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-h4 text-ink [overflow-wrap:anywhere]">{a.choreTitle}</p>
              <p className="mt-0.5 text-cap text-ink-2">
                Việc đột xuất · trước{dayKeyOf(a.dueAt) !== dayKeyOf(now) ? ` ${dueLabel(a.dueAt)}` : ''} <span className="font-mono">{dueTimeLabel(a.dueAt)}</span>
              </p>
            </div>
            <Button size="sm" variant="primary" loading={busyId === a.id} disabled={busyId !== null} onClick={() => onClaim(a)}>
              Nhận việc
            </Button>
          </li>
        ))}
      </ul>
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
  const claim = useClaim(houseId);
  const unclaimed = openUnclaimed(assignments, now);
  const onClaim = (a: Assignment) =>
    claim.mutate(a.id, {
      onSuccess: () => toast(`Bạn đã nhận "${a.choreTitle}". Nó nằm trong việc của bạn.`),
      onError: (e) => toast(messageForError(e)),
    });
  return (
    <section aria-label="Việc của bạn hôm nay" className="rounded-card border border-line bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Việc của bạn hôm nay</h2>
        <span className="font-mono text-cap text-ink-2">{mine.length}</span>
      </div>
      <TodayList mine={mine} houseId={houseId} meUserId={meUserId} graceHours={graceHours} now={now} />
      <UnclaimedList items={unclaimed} busyId={claim.isPending ? (claim.variables ?? null) : null} onClaim={onClaim} now={now} />
    </section>
  );
}
