import type { Assignment } from '@/features/chores/types.ts';
import { copyFor } from './copy.ts';
import type { Swap } from './types.ts';

const MINUTE = 60_000;

export interface SwapEntry {
  /** Mở được modal Đổi ca (ít nhất một tab dùng được). */
  canOpen: boolean;
  /** Lý do tab "Đổi với bạn" bị chặn (null = dùng được). Chỉ có nghĩa khi `canOpen`. */
  exchange: string | null;
  /** Lý do tab "Nhờ trực dùm" bị chặn. */
  cover: string | null;
  /** Ca vòng quay: chỉ nhờ được bằng quà (không làm bù). */
  giftOnly: boolean;
  /** Lý do cả modal bị chặn (để hiện trên thẻ), null nếu mở được hoặc không phải ca của mình. */
  blocked: string | null;
}

const CLOSED: SwapEntry = { canOpen: false, exchange: null, cover: null, giftOnly: false, blocked: null };

/**
 * Cổng thô quyết định có hiện nút "Đổi ca" trên thẻ ca hay không, theo bảng 4.3 của spec. Backend vẫn là nơi quyết
 * định cuối cùng và trả lý do chi tiết cho từng ứng viên (`swap-options`). `lockedIds` là các ca đang nằm trong yêu cầu chờ.
 */
export function swapEntry(a: Assignment, meUserId: string | undefined, now: Date, lockedIds: ReadonlySet<string>): SwapEntry {
  if (!meUserId || a.assigneeUserId !== meUserId || a.status !== 'TODO') return CLOSED;
  const due = new Date(a.dueAt).getTime();
  if (now.getTime() > due) return CLOSED;
  if (lockedIds.has(a.id)) return { ...CLOSED, blocked: copyFor('SLOT_LOCKED') };
  if (due - now.getTime() < 90 * MINUTE) return { ...CLOSED, blocked: copyFor('SWAP_TOO_LATE') };
  if (a.source === 'PAYBACK') return { ...CLOSED, blocked: copyFor('PAYBACK_SLOT_LOCKED') };

  return {
    canOpen: true,
    exchange: a.source === 'WHEEL' ? copyFor('WHEEL_NOT_EXCHANGEABLE') : null,
    cover: a.source === 'COVER' ? copyFor('COVER_CHAIN_FORBIDDEN') : null,
    giftOnly: a.source === 'WHEEL',
    blocked: null,
  };
}

/** Các ca đang bị khóa bởi yêu cầu chờ (cả ca nguồn lẫn ca đích). */
export function lockedAssignmentIds(swaps: readonly Swap[]): Set<string> {
  const ids = new Set<string>();
  for (const s of swaps) {
    if (s.status !== 'PENDING') continue;
    if (s.fromAssignment) ids.add(s.fromAssignment.id);
    if (s.toAssignment) ids.add(s.toAssignment.id);
  }
  return ids;
}
