import type { Activity } from './types.ts';

/** Gộp mục mới vào danh sách: bỏ trùng theo id, mới nhất trước, giữ tối đa `limit` mục. */
export function mergeActivities(current: readonly Activity[], incoming: readonly Activity[], limit = 50): Activity[] {
  const byId = new Map<string, Activity>();
  for (const a of [...incoming, ...current]) if (!byId.has(a.id)) byId.set(a.id, a);
  return [...byId.values()]
    .sort((x, y) => (x.createdAt === y.createdAt ? (x.id < y.id ? 1 : -1) : x.createdAt < y.createdAt ? 1 : -1))
    .slice(0, limit);
}

/** Mốc `createdAt` mới nhất đã thấy (để bù bằng `?since=` sau khi nối lại). */
export function latestCreatedAt(list: readonly Activity[]): string | null {
  return list.reduce<string | null>((max, a) => (max === null || a.createdAt > max ? a.createdAt : max), null);
}

/** Nhịp ticker: mỗi lần chỉ hiện thêm 1 mục mới, hàng đợi tối đa 10 (mục cũ nhất bị bỏ khi tràn). */
export const TICKER_INTERVAL_MS = 2_000;
export const TICKER_QUEUE_MAX = 10;
export const TICKER_SHOWN_MAX = 10;

export interface TickerState {
  shown: Activity[];
  queue: Activity[];
}

/**
 * Nhận danh sách mới nhất từ cache. Lần đầu (chưa hiện gì) thì hiện ngay; sau đó mục chưa thấy
 * vào hàng đợi (cũ trước) để nhả dần.
 */
export function tickerReceive(state: TickerState, latest: readonly Activity[]): TickerState {
  if (state.shown.length === 0 && state.queue.length === 0) return { shown: latest.slice(0, TICKER_SHOWN_MAX), queue: [] };
  const known = new Set([...state.shown, ...state.queue].map((a) => a.id));
  const fresh = latest.filter((a) => !known.has(a.id)).reverse();
  if (fresh.length === 0) return state;
  return { shown: state.shown, queue: [...state.queue, ...fresh].slice(-TICKER_QUEUE_MAX) };
}

/** Nhả một mục từ hàng đợi lên đầu ticker. */
export function tickerRelease(state: TickerState): TickerState {
  if (state.queue.length === 0) return state;
  const [next, ...rest] = state.queue;
  return { shown: [next, ...state.shown].slice(0, TICKER_SHOWN_MAX), queue: rest };
}
