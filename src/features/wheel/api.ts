import { api } from '@/lib/api.ts';
import type { WheelOptions, WheelSpin } from './types.ts';

const h = (houseId: string) => `/houses/${houseId}/wheel`;

export interface SpinInput {
  taskTitle: string;
  participantIds: string[];
  dueAt: string;
}

export const wheelApi = {
  options: (houseId: string) => api<WheelOptions>(`${h(houseId)}/options`),
  /** Thử lại khi lỗi mạng phải dùng lại đúng `idempotencyKey` cũ. */
  spin: (houseId: string, body: SpinInput, idempotencyKey: string) =>
    api<WheelSpin>(`${h(houseId)}/spin`, { method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
  /** null (204) khi không có vòng nào gần đây. */
  current: (houseId: string) => api<WheelSpin | null>(`${h(houseId)}/current`),
  spins: (houseId: string, limit = 20) => api<WheelSpin[]>(`${h(houseId)}/spins?limit=${limit}`),
  void: (spinId: string, reason: string) => api<WheelSpin>(`/wheel/spins/${spinId}/void`, { method: 'POST', body: { reason } }),
};
