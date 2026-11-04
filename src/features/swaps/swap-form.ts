import type { CreateSwapBody } from './api.ts';
import { rewardAmountSchema } from './schemas.ts';
import type { Compensation, SwapOption, SwapWarning } from './types.ts';

/** Câu cho từng cảnh báo mềm (W-1 … W-5). Người dùng chỉ thấy câu, không thấy mã. */
export const WARNING_TEXT: Record<SwapWarning, string> = {
  WEIGHT_GAP: 'Hai ca chênh nhau từ 2 điểm độ nặng trở lên.',
  FENCE_REPEAT: 'Người nhận đã làm việc này trong vài tuần gần đây.',
  OVER_DAILY_CAP: 'Người nhận sẽ có nhiều ca hơn mức thường trong ngày đó.',
  CONSECUTIVE_DAY: 'Người nhận sẽ làm cùng một việc hai ngày liền.',
  DUE_SOON: 'Ca này còn dưới 6 giờ tới hạn.',
};

const WARNINGS_HINT = 'Hãy đọc và tick xác nhận cảnh báo trước khi gửi.';
const REWARD_ERROR = 'Quà từ 1.000đ đến 500.000đ.';

/** Cảnh báo phải tick của lựa chọn đang chọn. Ca không hợp lệ thì không gửi được nên không có gì để tick. */
export function requiredWarnings(option: SwapOption | null | undefined): SwapWarning[] {
  return option?.valid ? option.warnings : [];
}

export function missingWarnings(required: SwapWarning[], acked: readonly SwapWarning[]): SwapWarning[] {
  return required.filter((w) => !acked.includes(w));
}

/** Nút gửi của tab đổi ca: khóa khi chưa chọn ca, ca không hợp lệ, đang gửi, hoặc còn cảnh báo chưa tick. */
export function exchangeSubmitState(input: { selected: SwapOption | null; acked: readonly SwapWarning[]; submitting: boolean }): {
  disabled: boolean;
  hint: string | null;
} {
  const { selected, acked, submitting } = input;
  if (!selected || !selected.valid || submitting) return { disabled: true, hint: null };
  if (missingWarnings(requiredWarnings(selected), acked).length > 0) return { disabled: true, hint: WARNINGS_HINT };
  return { disabled: false, hint: null };
}

/**
 * Ô nhập quà: bỏ trống = quà suông (không tiền). Nhận "30000", "30.000", "30.000đ". Chỉ nhận số nguyên VNĐ,
 * bội của 1.000 trong [1.000, 500.000] (R-SWAP-14).
 */
export function rewardInput(text: string): { amount: number | null; error: string | null } {
  const cleaned = text.trim().replace(/đ$/i, '').replace(/[.,\s]/g, '');
  if (cleaned === '') return { amount: null, error: null };
  if (!/^\d+$/.test(cleaned)) return { amount: null, error: REWARD_ERROR };
  const parsed = rewardAmountSchema.safeParse(Number(cleaned));
  return parsed.success ? { amount: parsed.data, error: null } : { amount: null, error: REWARD_ERROR };
}

const clean = (v: string | undefined) => v?.trim() || undefined;

export function exchangeBody(input: {
  fromAssignmentId: string;
  option: SwapOption;
  acked: readonly SwapWarning[];
  note: string;
  reason: string;
}): CreateSwapBody {
  const { fromAssignmentId, option, acked, note, reason } = input;
  return {
    type: 'EXCHANGE',
    fromAssignmentId,
    toAssignmentId: option.assignmentId,
    ...(clean(note) && { note: clean(note) }),
    ...(clean(reason) && { reason: clean(reason) }),
    acknowledgedWarnings: [...acked],
  };
}

/**
 * COVER: `targetMemberId = null` là đăng Chợ ca (không có lời nhắn, spec D5). Làm bù thì không có tiền
 * và không có ghi chú quà; quà thì tiền là tùy chọn.
 */
export function coverBody(input: {
  fromAssignmentId: string;
  targetMemberId: string | null;
  compensation: Compensation;
  rewardText: string;
  rewardNote: string;
  note: string;
  reason: string;
  acked: readonly SwapWarning[];
}): CreateSwapBody {
  const { fromAssignmentId, targetMemberId, compensation, rewardText, rewardNote, note, reason, acked } = input;
  const gift = compensation === 'GIFT';
  const amount = gift ? rewardInput(rewardText).amount : null;
  return {
    type: 'COVER',
    fromAssignmentId,
    ...(targetMemberId && { targetMemberId }),
    compensation,
    ...(amount !== null && { rewardAmount: amount }),
    ...(gift && clean(rewardNote) && { rewardNote: clean(rewardNote) }),
    ...(targetMemberId && clean(note) && { note: clean(note) }),
    ...(clean(reason) && { reason: clean(reason) }),
    acknowledgedWarnings: [...acked],
  };
}
