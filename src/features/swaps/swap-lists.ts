import type { Tone } from '@/components/ui/tones.ts';
import { ApiError } from '@/lib/api.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { copyFor, messageForSwapError } from './copy.ts';
import type { Swap } from './types.ts';

/** "Thiện muốn đổi ca với bạn" / "Thiện nhờ bạn trực dùm" / (Chợ ca) "Quân nhờ". */
export function swapHeadline(swap: Swap): string {
  const name = firstName(swap.requesterName);
  if (swap.type === 'EXCHANGE') return `${name} muốn đổi ca với bạn`;
  return swap.market ? `${name} nhờ` : `${name} nhờ bạn trực dùm`;
}

export interface CompensationLine {
  kind: 'GIFT' | 'PAYBACK';
  text: string;
  /** "30.000đ" (hiển thị bằng JetBrains Mono), null khi quà không tiền hoặc làm bù. */
  amountText: string | null;
}

/** Dòng đền đáp trên thẻ: quà (kèm tiền nếu có) hoặc làm bù. Đổi ca không có dòng này. */
export function compensationLine(swap: Swap): CompensationLine | null {
  if (swap.type !== 'COVER' || !swap.compensation) return null;
  if (swap.compensation === 'PAYBACK') return { kind: 'PAYBACK', text: 'Làm bù 1 ca cho bạn tuần sau', amountText: null };
  return {
    kind: 'GIFT',
    text: swap.rewardNote ?? (swap.rewardAmount ? 'Quà cảm ơn' : 'Lời cảm ơn'),
    amountText: swap.rewardAmount ? formatVnd(swap.rewardAmount) : null,
  };
}

/** Sau khi bấm nhận / đồng ý mà lỗi vì yêu cầu đã khác đi: bỏ thẻ khỏi danh sách (nó sẽ biến mất sau khi tải lại). */
const DROP_CODES = new Set(['SWAP_ALREADY_ACCEPTED', 'SWAP_NOT_PENDING', 'SWAP_EXPIRED', 'SLOT_CHANGED']);

export function acceptFailure(error: unknown): { message: string; dropCard: boolean } {
  const code = error instanceof ApiError ? error.code : undefined;
  return { message: messageForSwapError(error), dropCard: !!code && DROP_CODES.has(code) };
}

/** Nút "Nhận giúp": khóa kèm câu lý do khi backend báo bạn không đủ điều kiện. Thiếu thông tin thì để backend kiểm lại. */
export function marketAcceptState(swap: Swap): { disabled: boolean; reason: string | null } {
  const e = swap.eligibility;
  if (!e || e.canAccept) return { disabled: false, reason: null };
  return { disabled: true, reason: e.reasonText ?? copyFor(e.reasonCode ?? '') };
}

/** Chip trạng thái của yêu cầu mình đã gửi (mục "Yêu cầu của bạn"). */
export function outgoingChip(swap: Swap): { label: string; tone: Tone } {
  if (swap.status === 'EXPIRED') return { label: 'Chưa ai nhận', tone: 'tom' };
  if (swap.market) return { label: 'Đang ở Chợ ca', tone: 'sky' };
  return { label: `Chờ ${firstName(swap.targetName ?? 'người nhận')} trả lời`, tone: 'yellow' };
}
