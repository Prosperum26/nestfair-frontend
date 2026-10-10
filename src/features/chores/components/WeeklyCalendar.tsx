import { Brush, CircleCheck, Image, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { groupByDay } from '../grouping.ts';
import type { Assignment } from '../types.ts';
import { dayKeyOf, dueLabel, weekDays } from '../week.ts';
import { AssignmentCard } from './AssignmentCard.tsx';

const GRID = 'grid grid-cols-[minmax(150px,1.7fr)_repeat(7,minmax(0,1fr))]';

/** Dấu nhỏ góc avatar: trạng thái của ca (Design.md: check mint / alert tom / ảnh vàng). */
function StatusBadge({ status }: { status: Assignment['status'] }) {
  if (status === 'DONE') return <CircleCheck className="size-3.5 rounded-full bg-surface text-mint" aria-hidden />;
  if (status === 'PENDING_VERIFY') return <Image className="size-3.5 rounded-full bg-surface text-hl-ink" aria-hidden />;
  if (status === 'MISSED' || status === 'REJECTED') {
    return <TriangleAlert className="size-3.5 rounded-full bg-surface text-tom" aria-hidden />;
  }
  return null;
}

/**
 * Lịch tuần (preview 06). Desktop: mỗi việc một hàng, avatar nằm ở cột ngày hạn.
 * Mobile: danh sách thẻ gom theo ngày hạn.
 */
export function WeeklyCalendar({
  assignments,
  weekKey,
  meUserId,
  today = new Date(),
  onSelect,
  renderActions,
}: {
  assignments: Assignment[];
  weekKey: string;
  meUserId?: string;
  today?: Date;
  /** Bấm avatar trong ô lịch (vd. mở check-in / duyệt). Không truyền thì ô chỉ để xem. */
  onSelect?: (assignment: Assignment) => void;
  renderActions?: (assignment: Assignment) => ReactNode;
}) {
  const days = weekDays(weekKey);
  const todayKey = dayKeyOf(today);
  const byDay = groupByDay(assignments, weekKey);

  return (
    <>
      {/* Desktop */}
      <div className="hidden rounded-card border border-line bg-surface p-5 md:block">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-over uppercase text-ink-2">Lịch xoay vòng</p>
            <h2 className="font-display text-ct text-ink">Tuần {weekKey.slice(-2)}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip tone="mint" size="sm" icon={<CircleCheck />}>Hoàn thành</Chip>
            <Chip tone="yellow" size="sm" icon={<Image />}>Chờ duyệt</Chip>
            <Chip tone="tom" size="sm" icon={<TriangleAlert />}>Quá hạn</Chip>
          </div>
        </div>

        <div role="table" aria-label={`Lịch trực tuần ${weekKey.slice(-2)}`}>
          <div role="row" className={cn(GRID, 'rounded-btn-sm bg-paper-2 py-2')}>
            <span role="columnheader" className="px-3 font-mono text-over uppercase text-ink-2">Việc</span>
            {days.map((d) => (
              <span
                key={d.key}
                role="columnheader"
                className={cn('flex flex-col items-center font-mono text-cap text-ink-2', d.key === todayKey && 'text-ink')}
              >
                {d.label}
                <span className="text-sm font-medium text-ink">{d.day}</span>
              </span>
            ))}
          </div>

          {assignments.map((a) => {
            const dueKey = dayKeyOf(a.dueAt);
            const mine = a.assigneeUserId === meUserId;
            return (
              <div key={a.id} role="row" className={cn(GRID, 'items-center border-b border-line last:border-b-0')}>
                <div role="cell" className="flex min-w-0 items-center gap-3 px-3 py-3">
                  <IconTile icon={<Brush />} tone={avatarToneFor(a.choreId)} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{a.choreTitle}</p>
                    <p className="truncate text-cap text-ink-2">
                      Hạn <span className="font-mono">{dueLabel(a.dueAt)}</span> · độ nặng{' '}
                      <span className="font-mono">{a.weight}</span>
                    </p>
                  </div>
                </div>
                {days.map((d) => (
                  <div
                    key={d.key}
                    role="cell"
                    className={cn('flex h-full min-h-[64px] items-center justify-center', d.key === todayKey && 'bg-hl-soft/50')}
                  >
                    {d.key === dueKey ? (
                      <button
                        type="button"
                        disabled={!onSelect}
                        onClick={() => onSelect?.(a)}
                        aria-label={`${a.choreTitle}: ${mine ? 'bạn' : firstName(a.assigneeName)}`}
                        title={`${a.choreTitle} · ${mine ? 'Bạn' : a.assigneeName}`}
                        className="relative rounded-full focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-default"
                      >
                        <Avatar
                          name={a.assigneeName}
                          src={a.assigneeAvatarUrl}
                          tone={avatarToneFor(a.assigneeUserId)}
                          size={32}
                          className={cn(mine && 'ring-2 ring-ink')}
                        />
                        <span className="absolute -right-1 -bottom-1">
                          <StatusBadge status={a.status} />
                        </span>
                      </button>
                    ) : (
                      <span className="text-ink-3" aria-hidden>—</span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-5 md:hidden">
        {days
          .filter((d) => byDay[d.key].length > 0)
          .map((d) => (
            <section key={d.key} aria-label={`${d.label} ${d.day}.${d.month}`}>
              <h2 className="mb-2 font-mono text-over uppercase text-ink-2">
                {d.label} {d.day}.{d.month}
                {d.key === todayKey && ' · hôm nay'}
              </h2>
              <div className="flex flex-col gap-3">
                {byDay[d.key].map((a) => (
                  <AssignmentCard
                    key={a.id}
                    assignment={a}
                    isMine={a.assigneeUserId === meUserId}
                    actions={renderActions?.(a)}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>
    </>
  );
}
