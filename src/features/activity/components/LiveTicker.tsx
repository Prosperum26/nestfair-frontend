import { RotateCw } from 'lucide-react';
import { type CSSProperties, Fragment, useEffect, useReducer, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import type { HouseMember } from '@/features/houses/types.ts';
import { useSocket } from '@/features/realtime/context.ts';
import { cn } from '@/lib/cn.ts';
import { useReducedMotion } from '@/lib/use-reduced-motion.ts';
import { TICKER_INTERVAL_MS, type TickerState, tickerReceive, tickerRelease } from '../feed.ts';
import { activityLine, activityTime } from '../text.ts';
import type { Activity } from '../types.ts';

/** Đọc mục mới cho trình đọc màn hình tối đa 1 lần / 5 giây. */
const ANNOUNCE_GAP_MS = 5_000;
/** Tốc độ chạy: mỗi mục ~6 giây. */
const SECONDS_PER_ITEM = 6;

type Action = { type: 'receive'; items: Activity[] } | { type: 'release' };
const reducer = (s: TickerState, a: Action): TickerState => (a.type === 'receive' ? tickerReceive(s, a.items) : tickerRelease(s));

function TickerItem({ activity, me, members }: { activity: Activity; me?: string; members: Map<string, HouseMember> }) {
  const { text } = activityLine(activity, me);
  const member = activity.actorUserId ? members.get(activity.actorUserId) : undefined;
  return (
    <span className="flex shrink-0 items-center gap-2" title={text}>
      <Avatar
        name={activity.actorName}
        tone={avatarToneFor(activity.actorUserId ?? 'nestfair')}
        src={member?.avatarUrl}
        size={22}
      />
      <span className="text-sm font-medium whitespace-nowrap text-white">{text}</span>
      <span className="font-mono text-cap font-bold text-ink-on2">{activityTime(activity.createdAt)}</span>
    </span>
  );
}

/**
 * Dải "TRỰC TIẾP" (Design.md mục 4): chấm đỏ + overline · avatar cả nhà (chấm xanh = đang online) · vạch dọc ·
 * hoạt động chạy ngang, dừng khi rê chuột / focus. Giảm chuyển động thì thành danh sách tĩnh cuộn tay.
 */
export function LiveTicker({
  items,
  status,
  members,
  me,
  onRetry,
  onOpen,
}: {
  items: Activity[] | undefined;
  status: 'pending' | 'error' | 'success';
  members: HouseMember[] | undefined;
  me?: string;
  onRetry: () => void;
  onOpen: () => void;
}) {
  const { onlineUserIds } = useSocket();
  const reduced = useReducedMotion();
  const [state, dispatch] = useReducer(reducer, { shown: [], queue: [] });
  const [announce, setAnnounce] = useState('');
  const lastAnnounce = useRef(0);
  const memberMap = new Map((members ?? []).map((m) => [m.userId, m]));

  useEffect(() => {
    if (items) dispatch({ type: 'receive', items });
  }, [items]);

  // Nhiều mục dồn dập: mỗi 2 giây chỉ hiện thêm 1 mục.
  const queued = state.queue.length;
  useEffect(() => {
    if (queued === 0) return;
    const t = setTimeout(() => dispatch({ type: 'release' }), TICKER_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [queued, state.shown]);

  const newest = state.shown[0];
  useEffect(() => {
    if (!newest || Date.now() - lastAnnounce.current < ANNOUNCE_GAP_MS) return;
    lastAnnounce.current = Date.now();
    setAnnounce(activityLine(newest, me).text);
  }, [newest, me]);

  const shown = state.shown;
  const animate = !reduced && shown.length > 1;
  const row = (copy: number) =>
    shown.map((a, i) => (
      <Fragment key={`${copy}-${a.id}`}>
        {i > 0 && <span className="size-1 shrink-0 rounded-full bg-ink-line" aria-hidden />}
        <TickerItem activity={a} me={me} members={memberMap} />
      </Fragment>
    ));

  let body;
  if (status === 'pending') body = <span className="h-3 w-2/3 animate-pulse rounded-full bg-ink-soft" aria-label="Đang tải hoạt động" />;
  else if (status === 'error')
    body = (
      <span className="flex items-center gap-3 text-sm text-ink-on2">
        Không tải được hoạt động
        <button type="button" onClick={onRetry} className="flex items-center gap-1 font-semibold text-hl underline underline-offset-2">
          <RotateCw className="size-3.5" aria-hidden />
          Thử lại
        </button>
      </span>
    );
  else if (shown.length === 0) body = <p className="truncate text-sm text-ink-on2">Chưa có hoạt động nào. Thử check-in ca đầu tiên nhé!</p>;
  else
    body = (
      <button
        type="button"
        onClick={onOpen}
        aria-label="Xem hoạt động gần đây"
        className={cn(
          'group min-w-0 flex-1 text-left focus-visible:outline-none',
          reduced ? 'overflow-x-auto' : 'overflow-hidden',
        )}
      >
        <span
          className={cn(
            'flex w-max items-center gap-4',
            animate && 'animate-ticker group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]',
          )}
          style={animate ? ({ '--ticker-duration': `${shown.length * SECONDS_PER_ITEM}s` } as CSSProperties) : undefined}
        >
          {row(0)}
          {animate && (
            <span className="flex items-center gap-4" aria-hidden>
              <span className="size-1 shrink-0 rounded-full bg-ink-line" />
              {row(1)}
            </span>
          )}
        </span>
      </button>
    );

  return (
    <div className="flex h-11 items-center gap-3 overflow-hidden rounded-[14px] bg-ink px-4 lg:h-[52px]">
      <span className="flex shrink-0 items-center gap-2">
        <span className="size-2 rounded-full bg-tom-v" aria-hidden />
        <span className="font-mono text-over uppercase text-hl">Trực tiếp</span>
      </span>
      <span className="hidden shrink-0 -space-x-1.5 sm:flex">
        {members?.map((m) => (
          <span key={m.userId} className="relative">
            <Avatar name={m.fullName} tone={avatarToneFor(m.userId)} src={m.avatarUrl} size={24} className="ring-2 ring-ink" />
            <span
              className={cn(
                'absolute -right-0.5 -bottom-0.5 size-2 rounded-full ring-2 ring-ink',
                onlineUserIds.includes(m.userId) ? 'bg-mint-v' : 'bg-ink-on2',
              )}
              aria-hidden
            />
          </span>
        ))}
      </span>
      <span className="hidden h-5 w-px shrink-0 bg-ink-line sm:block" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center">{body}</div>
      <span className="sr-only" aria-live="polite">
        {announce}
      </span>
    </div>
  );
}
