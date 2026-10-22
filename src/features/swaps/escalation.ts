import { ApiError } from '@/lib/api.ts';
import type { EscalateBody } from './api.ts';
import { copyFor } from './copy.ts';
import { rewardInput } from './swap-form.ts';
import type { EscalateAction } from './types.ts';

/** Dòng nhắc dưới ba nút (spec 5.6): không chọn gì thì mặc định tự chịu. */
export const ESCALATE_NOTE = 'Không chọn gì thì ca vẫn là của bạn.';

/** Lý do khóa từng nút, ghi nhận từ lỗi backend trả về (ESCALATE_TOO_LATE, NO_RESEND_CANDIDATE, ESCALATE_LIMIT). */
export interface EscalateBlocks {
  reward?: string;
  resend?: string;
}

export function recordEscalateError(blocks: EscalateBlocks, error: unknown): EscalateBlocks {
  const code = error instanceof ApiError ? error.code : undefined;
  if (code === 'ESCALATE_TOO_LATE' || code === 'ESCALATE_LIMIT') {
    const reason = copyFor(code);
    return { ...blocks, reward: reason, resend: reason };
  }
  if (code === 'NO_RESEND_CANDIDATE') return { ...blocks, resend: copyFor(code) };
  return blocks;
}

export interface EscalateButton {
  action: EscalateAction;
  label: string;
  disabled: boolean;
  /** Vì sao khóa (null = bấm được). */
  reason: string | null;
}

/** `pending`: đang gửi một hành động, khóa cả ba nút để không gửi hai hành động cùng lúc. */
export function escalateButtons(blocks: EscalateBlocks, pending = false): EscalateButton[] {
  return [
    { action: 'ADD_REWARD', label: 'Thêm quà và đăng lại', disabled: pending || !!blocks.reward, reason: blocks.reward ?? null },
    { action: 'RESEND', label: 'Gửi người khác', disabled: pending || !!blocks.resend, reason: blocks.resend ?? null },
    { action: 'SELF', label: 'Tự làm ca này', disabled: pending, reason: null },
  ];
}

/** Body leo thang. ADD_REWARD cần số tiền hợp lệ hoặc một lời nhắn quà mới. */
export function escalateBody(action: EscalateAction, input: { amountText: string; note: string }): { ok: true; body: EscalateBody } | { ok: false; error: string } {
  if (action !== 'ADD_REWARD') return { ok: true, body: { action } };
  const reward = rewardInput(input.amountText);
  if (reward.error) return { ok: false, error: reward.error };
  const note = input.note.trim();
  if (reward.amount === null && !note) return { ok: false, error: 'Hãy nhập số tiền quà hoặc một lời nhắn mới.' };
  return { ok: true, body: { action, ...(reward.amount !== null && { rewardAmount: reward.amount }), ...(note && { rewardNote: note }) } };
}
