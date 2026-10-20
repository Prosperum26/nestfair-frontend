import { api } from '@/lib/api.ts';
import type { Activity } from './types.ts';

const base = (houseId: string) => `/houses/${houseId}/activity`;

export const activityApi = {
  /** Mới nhất trước; `before` để cuộn thêm. */
  list: (houseId: string, opts: { limit?: number; before?: string } = {}) => {
    const q = new URLSearchParams();
    if (opts.limit) q.set('limit', String(opts.limit));
    if (opts.before) q.set('before', opts.before);
    const qs = q.toString();
    return api<Activity[]>(`${base(houseId)}${qs ? `?${qs}` : ''}`);
  },
  /** Bù sau khi nối lại: các mục mới hơn `since` (tối đa 100). */
  since: (houseId: string, since: string) => api<Activity[]>(`${base(houseId)}?since=${encodeURIComponent(since)}`),
};
