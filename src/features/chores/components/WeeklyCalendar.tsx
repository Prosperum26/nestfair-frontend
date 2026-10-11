import { Ban, Brush, CircleCheck, Image, TriangleAlert, UserX } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { buildCalendarRows, collapseDay, groupByDay } from '../grouping.ts';
import type { Assignment } from '../types.ts';
import { dayKeyOf, dueTimeLabel, weekDays } from '../week.ts';
import { AssignmentCard } from './AssignmentCard.tsx';

const GRID = 'grid grid-cols-[minmax(150px,1.7fr)_repeat(7,minmax(0,1fr))]';
const MAX_AVATARS = 2;
const MOBILE_MAX = 3;

/** Dấu nhỏ góc avatar: trạng thái của ca. */
function StatusBadge({ status }: { status: Assignment['status'] }) {
  const cls = 'size-3.5 rounded-full bg-surface';
  if (status === 'DONE') return <CircleCheck className={cn(cls, 'text-mint')} aria-hidden />;
  if (status === 'PENDING_VERIFY') return <Image className={cn(cls, 'text-hl-ink')} aria-hidden />;
  if (status === 'MISSED' || status === 'REJECTED') return <TriangleAlert className={cn(cls, 'text-tom')} aria-hidden />;
  if (status === 'CANCELLED') return <Ban className={cn(cls, 'text-ink-3')} aria-hidden />;
  return null;
}

/** Avatar của một ca trong ô lịch (nút bấm được nếu có `onSelect`). */
function CellAvatar({ a, meUserId, onSelect }: { a: Assignment; meUserId?: string; onSelect?: (a: Assignment) => void }) {
  const mine = !!a.assigneeUserId && a.assigneeUserId === meUserId;
  const who = a.assigneeName ? (mine ? 'bạn' : firstName(a.assigneeName)) : 'chưa có người';
  return (
    <button
      type="button"
      disabled={!onSelect}
      onClick={() => onSelect?.(a)}
      aria-label={`${a.choreTitle}: ${who}`}
      title={`${a.choreTitle} · ${a.assigneeName ?? 'Chưa có người'} · ${dueTimeLabel(a.dueAt)}`}
      className={cn('relative rounded-full focus-visible:outline-none focus-visible:shadow-focus disabled:cursor-default', a.status === 'CANCELLED' && 'opacity-50')}
    >
      {a.assigneeUserId && a.assigneeName ? (
        <Avatar name={a.assigneeName} src={a.assigneeAvatarUrl} tone={avatarToneFor(a.assigneeUserId)} size={32} className={cn(mine && 'ring-2 ring-ink')} />
      ) : (
        <span className="inline-flex size-8 items-center justify-center rounded-full border border-dashed border-line-2 text-ink-3">
          <UserX className="size-4" aria-hidden />
        </span>
      )}
      <span className="absolute -right-1 -bottom-1">
        <StatusBadge status={a.status} />
      </span>
    </button>
  );
}

/**
 * Lịch tuần (preview 06). Desktop: mỗi việc một hàng, bảy cột ngày, ca nằm đúng ngày làm (nhiều ca/ngày xếp chồng).
 * Mobile: danh sách thẻ theo ngày, ngày có nhiều ca thì rút gọn "+N".
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
  const rows = buildCalendarRows(assignments, weekKey);
  const byDay = groupByDay(assignments, weekKey);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
              <span key={d.key} role="columnheader" className={cn('flex flex-col items-center font-mono text-cap text-ink-2', d.key === todayKey && 'text-ink')}>
                {d.label}
                <span className="text-sm font-medium text-ink">{d.day}</span>
              </span>
            ))}
          </div>

          {rows.map((row) => (
            <div key={row.choreId} role="row" className={cn(GRID, 'items-center border-b border-line last:border-b-0')}>
              <div role="cell" className="flex min-w-0 items-center gap-3 px-3 py-3">
                <IconTile icon={<Brush />} tone={avatarToneFor(row.choreId)} size={36} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{row.title}</p>
                  <p className="truncate text-cap text-ink-2">
                    Độ nặng <span className="font-mono">{row.weight}</span>
                  </p>
                </div>
              </div>
              {days.map((d) => {
                const list = row.cells[d.key];
                const { shown, hidden } = collapseDay(list, MAX_AVATARS);
                return (
                  <div key={d.key} role="cell" className={cn('flex h-full min-h-[64px] items-center justify-center gap-1', d.key === todayKey && 'bg-hl-soft/50')}>
                    {list.length === 0 ? (
                      <span className="text-ink-3" aria-hidden>—</span>
                    ) : (
                      <>
                        {shown.map((a) => (
                          <CellAvatar key={a.id} a={a} meUserId={meUserId} onSelect={onSelect} />
                        ))}
                        {hidden > 0 && <span className="font-mono text-cap text-ink-2">+{hidden}</span>}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="flex flex-col gap-5 md:hidden">
        {days
          .filter((d) => byDay[d.key].length > 0)
          .map((d) => {
            const { shown, hidden } = collapseDay(byDay[d.key], MOBILE_MAX, expanded[d.key]);
            return (
              <section key={d.key} aria-label={`${d.label} ${d.day}.${d.month}`}>
                <h2 className="mb-2 font-mono text-over uppercase text-ink-2">
                  {d.label} {d.day}.{d.month}
                  {d.key === todayKey && ' · hôm nay'}
                </h2>
                <div className="flex flex-col gap-3">
                  {shown.map((a) => (
                    <AssignmentCard key={a.id} assignment={a} isMine={!!a.assigneeUserId && a.assigneeUserId === meUserId} actions={renderActions?.(a)} />
                  ))}
                  {hidden > 0 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((e) => ({ ...e, [d.key]: true }))}
                      className="h-10 rounded-btn border border-line-2 bg-surface font-mono text-sm text-ink-2 hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus"
                    >
                      +{hidden} ca nữa
                    </button>
                  )}
                </div>
              </section>
            );
          })}
      </div>
    </>
  );
}
