import { api } from '@/lib/api.ts';
import type { ReminderDto, ReminderInput, ReminderListParams, ReminderPatch } from './types.ts';

/**
 * Giả định response contract chưa ghi rõ (đối chiếu với BE-4):
 * - GET /reminders trả mảng thẳng ReminderDto[] (đúng convention expenses/settlements của repo);
 * - PATCH /reminders/:id trả ReminderDto đã cập nhật;
 * - DELETE trả { ok: true } hoặc 204 rỗng — caller không dùng kết quả.
 */
export const remindersApi = {
  /** Nhắc của chính người gọi; state bỏ trống backend dùng "upcoming". */
  list: (params: ReminderListParams = {}) => {
    const q = new URLSearchParams();
    if (params.state) q.set('state', params.state);
    if (params.limit !== undefined) q.set('limit', String(params.limit));
    const qs = q.toString();
    return api<ReminderDto[]>(`/reminders${qs ? `?${qs}` : ''}`);
  },
  create: (body: ReminderInput) => api<ReminderDto>('/reminders', { method: 'POST', body }),
  update: (id: string, body: ReminderPatch) => api<ReminderDto>(`/reminders/${id}`, { method: 'PATCH', body }),
  remove: (id: string) => api<{ ok: true }>(`/reminders/${id}`, { method: 'DELETE' }),
};
