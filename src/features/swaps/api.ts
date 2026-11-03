import { api } from '@/lib/api.ts';
import type {
  AcceptResult,
  Compensation,
  DebtGroupsResponse,
  DebtScope,
  EscalateAction,
  EscalateResult,
  OptionType,
  PaybackOptions,
  PaybackResult,
  Swap,
  SwapOptions,
  SwapScope,
  SwapSummary,
} from './types.ts';

/** Body POST /houses/:id/swaps (khớp CreateSwapDto). */
export interface CreateSwapBody {
  type: 'EXCHANGE' | 'COVER';
  fromAssignmentId: string;
  /** EXCHANGE: bắt buộc. */
  toAssignmentId?: string;
  /** COVER: bỏ trống = Chợ ca. */
  targetMemberId?: string;
  /** COVER: bắt buộc. */
  compensation?: Compensation;
  rewardNote?: string;
  rewardAmount?: number;
  reason?: string;
  note?: string;
  acknowledgedWarnings?: string[];
}

export interface EscalateBody {
  action: EscalateAction;
  rewardNote?: string;
  rewardAmount?: number;
  targetMemberId?: string;
}

const h = (houseId: string) => `/houses/${houseId}`;
const key = (idempotencyKey: string) => ({ 'Idempotency-Key': idempotencyKey });

export const swapApi = {
  options: (assignmentId: string, type: OptionType, compensation?: Compensation) =>
    api<SwapOptions>(`/assignments/${assignmentId}/swap-options?type=${type}${compensation ? `&compensation=${compensation}` : ''}`),
  create: (houseId: string, body: CreateSwapBody, idempotencyKey: string) =>
    api<Swap>(`${h(houseId)}/swaps`, { method: 'POST', body, headers: key(idempotencyKey) }),
  list: (houseId: string, scope: SwapScope) => api<Swap[]>(`${h(houseId)}/swaps?scope=${scope}`),
  summary: (houseId: string) => api<SwapSummary>(`${h(houseId)}/swaps/summary`),
  accept: (swapId: string, idempotencyKey: string) => api<AcceptResult>(`/swaps/${swapId}/accept`, { method: 'PATCH', headers: key(idempotencyKey) }),
  reject: (swapId: string, reason?: string) => api<Swap>(`/swaps/${swapId}/reject`, { method: 'PATCH', body: reason ? { reason } : {} }),
  cancel: (swapId: string) => api<Swap>(`/swaps/${swapId}/cancel`, { method: 'PATCH' }),
  escalate: (swapId: string, body: EscalateBody, idempotencyKey: string) =>
    api<EscalateResult>(`/swaps/${swapId}/escalate`, { method: 'POST', body, headers: key(idempotencyKey) }),
};

export const debtApi = {
  list: (houseId: string, scope: DebtScope) => api<DebtGroupsResponse>(`${h(houseId)}/chore-debts?scope=${scope}`),
  paybackOptions: (debtId: string) => api<PaybackOptions>(`/chore-debts/${debtId}/payback-options`),
  payback: (debtId: string, assignmentId: string, idempotencyKey: string) =>
    api<PaybackResult>(`/chore-debts/${debtId}/payback`, { method: 'PATCH', body: { assignmentId }, headers: key(idempotencyKey) }),
  forgive: (debtId: string) => api<{ debtId: string; status: 'FORGIVEN' }>(`/chore-debts/${debtId}/forgive`, { method: 'PATCH' }),
};
