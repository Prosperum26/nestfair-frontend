import { describe, expect, it } from 'vitest';
import { balanceSentence, dissolveNameMatches, kickBody, kickSteps, leaveBlocker, projectedBalance } from './flow.ts';
import type { LeavePreview } from './types.ts';

const preview = (over: Partial<LeavePreview> = {}): LeavePreview => ({
  userId: 'u-quan',
  fullName: 'Nguyễn Minh Quân',
  role: 'ROOMMATE',
  net: 0,
  pendingSettlements: 0,
  openChoreDebts: 0,
  futureShifts: 0,
  isLastMember: false,
  ...over,
});

describe('balanceSentence', () => {
  it('nợ / chưa nhận / không còn khoản nào, tiền đúng định dạng', () => {
    expect(balanceSentence('Quân', -170_000)).toBe('Quân còn nợ 170.000đ');
    expect(balanceSentence('Mai', 380_000)).toBe('Mai chưa nhận 380.000đ');
    expect(balanceSentence('Thiện', 0)).toBe('Thiện không còn khoản nào');
  });
});

describe('projectedBalance', () => {
  it('người nhận gánh đúng số dư của người bị xóa', () => {
    expect(projectedBalance(-380_000, -170_000)).toBe(-550_000);
    expect(projectedBalance(100_000, 50_000)).toBe(150_000);
  });
});

describe('kickSteps', () => {
  it('hết nợ: chỉ một bước xác nhận', () => {
    expect(kickSteps(0, null)).toEqual(['confirm']);
  });

  it('còn nợ: báo số tiền → chọn cách xử lý → (chọn người nhận) → xác nhận', () => {
    expect(kickSteps(-170_000, null)).toEqual(['balance', 'decide', 'confirm']);
    expect(kickSteps(-170_000, 'WRITE_OFF')).toEqual(['balance', 'decide', 'confirm']);
    expect(kickSteps(-170_000, 'TRANSFER')).toEqual(['balance', 'decide', 'pick', 'confirm']);
  });
});

describe('kickBody', () => {
  it('hết nợ thì không gửi mode; luôn gửi cách xử lý ca', () => {
    expect(kickBody({ net: 0, mode: 'WRITE_OFF', toUserId: 'u-mai', shifts: 'MANUAL' })).toEqual({ shifts: 'MANUAL' });
  });

  it('chuyển thì gửi người nhận, xóa thì không', () => {
    expect(kickBody({ net: -1, mode: 'TRANSFER', toUserId: 'u-mai', shifts: 'AUTO' })).toEqual({ mode: 'TRANSFER', toUserId: 'u-mai', shifts: 'AUTO' });
    expect(kickBody({ net: -1, mode: 'WRITE_OFF', toUserId: 'u-mai', shifts: 'AUTO' })).toEqual({ mode: 'WRITE_OFF', shifts: 'AUTO' });
  });
});

describe('leaveBlocker', () => {
  it('người cuối cùng không rời được', () => {
    expect(leaveBlocker(preview({ isLastMember: true, role: 'ADMIN' }))).toEqual({
      code: 'LAST_MEMBER',
      message: 'Bạn là người cuối cùng trong nhà nên chưa rời được. Muốn dừng hẳn thì giải tán nhà ở Cài đặt nhà.',
    });
  });

  it('còn nợ / chưa nhận thì chặn, kèm số tiền', () => {
    expect(leaveBlocker(preview({ net: -50_000 }))).toEqual({
      code: 'HAS_BALANCE',
      message: 'Bạn còn nợ 50.000đ. Thanh toán xong rồi mới rời nhà được.',
    });
    expect(leaveBlocker(preview({ net: 80_000 }))).toEqual({
      code: 'HAS_BALANCE',
      message: 'Bạn chưa nhận 80.000đ. Nhận đủ rồi mới rời nhà được.',
    });
  });

  it('hết nợ thì rời được', () => {
    expect(leaveBlocker(preview())).toBeNull();
  });
});

describe('dissolveNameMatches', () => {
  it('khớp đúng tên nhà, bỏ khoảng trắng đầu cuối', () => {
    expect(dissolveNameMatches('  Nhà 12A ', 'Nhà 12A')).toBe(true);
  });

  it('phân biệt hoa thường để xác nhận có chủ đích', () => {
    expect(dissolveNameMatches('nhà 12a', 'Nhà 12A')).toBe(false);
  });

  it('để trống hoặc sai tên thì chưa khớp', () => {
    expect(dissolveNameMatches('', 'Nhà 12A')).toBe(false);
    expect(dissolveNameMatches('Nhà 12', 'Nhà 12A')).toBe(false);
  });
});
