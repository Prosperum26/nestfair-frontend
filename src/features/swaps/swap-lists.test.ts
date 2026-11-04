import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { acceptFailure, compensationLine, marketAcceptState, outgoingChip, swapHeadline } from './swap-lists.ts';
import type { Swap } from './types.ts';

const swap = (over: Partial<Swap> = {}): Swap => ({
  id: 's1',
  type: 'COVER',
  status: 'PENDING',
  resolution: null,
  requesterMemberId: 'm1',
  requesterName: 'Trần Minh Hùng',
  targetMemberId: null,
  targetName: null,
  fromAssignment: { id: 'a1', choreTitle: 'Lau nhà', occurrenceDate: '2026-10-24', dueAt: '2026-10-24T11:00:00Z', weight: 3, assigneeId: 'm1' },
  toAssignment: null,
  compensation: 'GIFT',
  rewardNote: null,
  rewardAmount: null,
  reason: null,
  note: null,
  rejectReason: null,
  expiresAt: '2026-10-22T03:00:00Z',
  createdAt: '2026-10-21T03:00:00Z',
  acceptedAt: null,
  rootRequestId: 's1',
  market: true,
  ...over,
});

describe('swapHeadline', () => {
  it('yêu cầu đổi ca gửi tới bạn', () => {
    expect(swapHeadline(swap({ type: 'EXCHANGE', market: false, targetMemberId: 'm2', requesterName: 'Lê Đức Thiện' }))).toBe('Thiện muốn đổi ca với bạn');
  });

  it('nhờ trực dùm đích danh và Chợ ca', () => {
    expect(swapHeadline(swap({ market: false, targetMemberId: 'm2', requesterName: 'Lê Đức Thiện' }))).toBe('Thiện nhờ bạn trực dùm');
    expect(swapHeadline(swap({ requesterName: 'Nguyễn Minh Quân' }))).toBe('Quân nhờ');
  });
});

describe('compensationLine', () => {
  it('quà có tiền: lời cảm ơn và số tiền dạng 30.000đ', () => {
    expect(compensationLine(swap({ rewardNote: 'Bao 1 ly trà sữa', rewardAmount: 30000 }))).toEqual({ kind: 'GIFT', text: 'Bao 1 ly trà sữa', amountText: '30.000đ' });
  });

  it('quà không tiền: chỉ lời cảm ơn, không có số tiền', () => {
    expect(compensationLine(swap({ rewardNote: 'Cảm ơn nhiều' }))).toEqual({ kind: 'GIFT', text: 'Cảm ơn nhiều', amountText: null });
    expect(compensationLine(swap({}))).toEqual({ kind: 'GIFT', text: 'Lời cảm ơn', amountText: null });
  });

  it('làm bù: bạn làm 1 ca cho người nhờ ở tuần sau', () => {
    expect(compensationLine(swap({ compensation: 'PAYBACK' }))).toEqual({ kind: 'PAYBACK', text: 'Làm bù 1 ca cho bạn tuần sau', amountText: null });
  });

  it('đổi ca không có dòng đền đáp', () => {
    expect(compensationLine(swap({ type: 'EXCHANGE', compensation: null }))).toBeNull();
  });
});

describe('acceptFailure', () => {
  it('Chợ ca đã có người nhận: thẻ biến khỏi danh sách', () => {
    const res = acceptFailure(new ApiError(409, 'x', 'SWAP_ALREADY_ACCEPTED'));
    expect(res).toEqual({ message: 'Ca đã có người nhận.', dropCard: true });
  });

  it('yêu cầu không còn hiệu lực, hết hạn, ca đã đổi: cũng bỏ thẻ', () => {
    for (const code of ['SWAP_NOT_PENDING', 'SWAP_EXPIRED', 'SLOT_CHANGED']) {
      expect(acceptFailure(new ApiError(409, 'x', code)).dropCard, code).toBe(true);
    }
  });

  it('lỗi riêng của người bấm (vắng, trùng việc): giữ thẻ cho người khác, báo đúng câu', () => {
    const res = acceptFailure(new ApiError(422, 'Mai vắng ngày 25.10.', 'TARGET_ABSENT'));
    expect(res.dropCard).toBe(false);
    expect(res.message).toBe('Mai vắng ngày 25.10.');
  });

  it('lỗi mạng: giữ thẻ, có câu tiếng Việt', () => {
    const res = acceptFailure(new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.'));
    expect(res.dropCard).toBe(false);
    expect(res.message).toContain('Không kết nối');
  });
});

describe('marketAcceptState', () => {
  it('đủ điều kiện thì bấm được', () => {
    expect(marketAcceptState(swap({ eligibility: { canAccept: true } }))).toEqual({ disabled: false, reason: null });
  });

  it('không đủ điều kiện: khóa nút kèm câu lý do', () => {
    expect(marketAcceptState(swap({ eligibility: { canAccept: false, reasonCode: 'TARGET_ABSENT', reasonText: 'Mai vắng ngày 25.10.' } }))).toEqual({
      disabled: true,
      reason: 'Mai vắng ngày 25.10.',
    });
  });

  it('chưa có thông tin điều kiện thì vẫn cho bấm (backend kiểm lại)', () => {
    expect(marketAcceptState(swap({}))).toEqual({ disabled: false, reason: null });
  });
});

describe('outgoingChip', () => {
  it('đích danh: chờ người nhận trả lời', () => {
    expect(outgoingChip(swap({ market: false, targetMemberId: 'm2', targetName: 'Phạm Ngọc Mai' }))).toEqual({ label: 'Chờ Mai trả lời', tone: 'yellow' });
  });

  it('Chợ ca: đang chờ người nhận', () => {
    expect(outgoingChip(swap({}))).toEqual({ label: 'Đang ở Chợ ca', tone: 'sky' });
  });

  it('đã hết hạn mà chưa ai nhận', () => {
    expect(outgoingChip(swap({ status: 'EXPIRED' }))).toEqual({ label: 'Chưa ai nhận', tone: 'tom' });
  });
});
