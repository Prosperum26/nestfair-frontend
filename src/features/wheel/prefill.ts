import type { WheelPrefill } from './store.ts';

/** Đọc `location.state` của react-router: chỉ nhận đúng dạng do ActionButtons gửi, mọi thứ khác bị bỏ. */
export function readWheelPrefill(state: unknown): WheelPrefill | null {
  if (typeof state !== 'object' || state === null) return null;
  const p = (state as { wheelPrefill?: unknown }).wheelPrefill;
  if (typeof p !== 'object' || p === null) return null;
  const { title, sourceKey } = p as { title?: unknown; sourceKey?: unknown };
  return typeof title === 'string' && typeof sourceKey === 'string' ? { title, sourceKey } : null;
}
