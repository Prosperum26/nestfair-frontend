import { api } from '@/lib/api.ts';
import type { PaymentInfo, Settlement, SettlementInput, SettlementPlan } from './types.ts';

const h = (houseId: string) => `/houses/${houseId}/settlements`;

export const settlementsApi = {
  plan: (houseId: string) => api<SettlementPlan>(`${h(houseId)}/plan`),
  paymentInfo: (houseId: string, userId: string) => api<PaymentInfo>(`${h(houseId)}/payment-info/${userId}`),
  /** `month` bỏ trống = toàn bộ lịch sử. */
  list: (houseId: string, opts: { month?: string; scope: 'all' | 'mine' }) => {
    const params = new URLSearchParams({ scope: opts.scope });
    if (opts.month) params.set('month', opts.month);
    return api<Settlement[]>(`${h(houseId)}?${params.toString()}`);
  },
  create: (houseId: string, body: SettlementInput) => api<Settlement>(h(houseId), { method: 'POST', body }),
  confirm: (houseId: string, id: string) => api<Settlement>(`${h(houseId)}/${id}/confirm`, { method: 'PATCH' }),
  cancel: (houseId: string, id: string) => api<Settlement>(`${h(houseId)}/${id}/cancel`, { method: 'PATCH' }),
  uploadProof: (houseId: string, photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('photo', photo, filename);
    return api<{ url: string }>(`${h(houseId)}/proof`, { method: 'POST', body });
  },
};
