import { ApiError } from '@/lib/api.ts';
import { formatVnd } from '@/lib/format.ts';
import type { AdjustmentMode, KickInput, LeavePreview, ShiftMode } from './types.ts';

/** "Quân còn nợ 170.000đ" / "Mai chưa nhận 380.000đ". */
export function balanceSentence(name: string, net: number): string {
  if (net < 0) return `${name} còn nợ ${formatVnd(-net)}`;
  if (net > 0) return `${name} chưa nhận ${formatVnd(net)}`;
  return `${name} không còn khoản nào`;
}

/** Số dư mới của người nhận khi chọn "Chuyển cho thành viên khác". */
export const projectedBalance = (recipientNet: number, leaverNet: number) => recipientNet + leaverNet;

/** Các bước của hộp thoại xóa thành viên (spec "Luồng kick"). Lựa chọn ca nằm ở bước xác nhận. */
export type KickStep = 'balance' | 'decide' | 'pick' | 'confirm';

export function kickSteps(net: number, mode: AdjustmentMode | null): KickStep[] {
  if (net === 0) return ['confirm'];
  return mode === 'TRANSFER' ? ['balance', 'decide', 'pick', 'confirm'] : ['balance', 'decide', 'confirm'];
}

/** Body gửi DELETE /members/:userId. Hết nợ thì không gửi `mode`: server tự tính lại số dư. */
export function kickBody(state: { net: number; mode: AdjustmentMode | null; toUserId: string | null; shifts: ShiftMode }): KickInput {
  if (state.net === 0 || !state.mode) return { shifts: state.shifts };
  return state.mode === 'TRANSFER'
    ? { mode: 'TRANSFER', toUserId: state.toUserId ?? undefined, shifts: state.shifts }
    : { mode: 'WRITE_OFF', shifts: state.shifts };
}

/** Lý do chưa rời nhà được (khớp 409 của backend), null nếu rời được. */
export function leaveBlocker(preview: LeavePreview): { code: 'LAST_MEMBER' | 'HAS_BALANCE'; message: string } | null {
  if (preview.isLastMember) return { code: 'LAST_MEMBER', message: 'Bạn là người cuối cùng trong nhà nên chưa rời được.' };
  if (preview.net < 0) {
    return { code: 'HAS_BALANCE', message: `Bạn còn nợ ${formatVnd(-preview.net)}. Thanh toán xong rồi mới rời nhà được.` };
  }
  if (preview.net > 0) {
    return { code: 'HAS_BALANCE', message: `Bạn chưa nhận ${formatVnd(preview.net)}. Nhận đủ rồi mới rời nhà được.` };
  }
  return null;
}

/** Lỗi nghiệp vụ có câu tiếng Việt từ backend; lỗi khác dùng câu chung. */
export function membershipErrorMessage(error: unknown): string {
  if (error instanceof ApiError && (error.code || error.statusCode < 500)) return error.message;
  return 'Không thực hiện được, thử lại sau ít phút.';
}
