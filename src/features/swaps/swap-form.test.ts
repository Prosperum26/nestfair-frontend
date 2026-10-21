import { describe, expect, it } from 'vitest';
import { coverBody, exchangeBody, exchangeSubmitState, missingWarnings, requiredWarnings, rewardInput, WARNING_TEXT } from './swap-form.ts';
import type { SwapOption, SwapWarning } from './types.ts';

const option = (over: Partial<SwapOption> = {}): SwapOption => ({
  assignmentId: 'a3',
  memberId: 'm2',
  memberName: 'Thiện',
  valid: true,
  warnings: [],
  ...over,
});

describe('cảnh báo mềm', () => {
  it('chỉ ca hợp lệ mới đòi tick; ca không hợp lệ thì không có gì để tick', () => {
    expect(requiredWarnings(option({ warnings: ['WEIGHT_GAP', 'DUE_SOON'] }))).toEqual(['WEIGHT_GAP', 'DUE_SOON']);
    expect(requiredWarnings(option({ valid: false, warnings: ['WEIGHT_GAP'] }))).toEqual([]);
    expect(requiredWarnings(null)).toEqual([]);
  });

  it('missingWarnings: còn thiếu những cảnh báo chưa tick', () => {
    const required: SwapWarning[] = ['WEIGHT_GAP', 'DUE_SOON'];
    expect(missingWarnings(required, [])).toEqual(['WEIGHT_GAP', 'DUE_SOON']);
    expect(missingWarnings(required, ['WEIGHT_GAP'])).toEqual(['DUE_SOON']);
    expect(missingWarnings(required, ['DUE_SOON', 'WEIGHT_GAP'])).toEqual([]);
  });

  it('mỗi cảnh báo có câu tiếng Việt, không có mã', () => {
    for (const code of ['WEIGHT_GAP', 'FENCE_REPEAT', 'OVER_DAILY_CAP', 'CONSECUTIVE_DAY', 'DUE_SOON'] as const) {
      expect(WARNING_TEXT[code], code).toBeTruthy();
      expect(WARNING_TEXT[code], code).not.toMatch(/W-\d|[A-Z]{3,}_[A-Z_]+/);
    }
  });
});

describe('exchangeSubmitState', () => {
  it('chưa chọn ca thì khóa nút gửi', () => {
    expect(exchangeSubmitState({ selected: null, acked: [], submitting: false })).toMatchObject({ disabled: true });
  });

  it('ca hợp lệ không cảnh báo thì gửi được', () => {
    expect(exchangeSubmitState({ selected: option(), acked: [], submitting: false })).toEqual({ disabled: false, hint: null });
  });

  it('ca có cảnh báo: khóa đến khi tick đủ, kèm gợi ý', () => {
    const selected = option({ warnings: ['WEIGHT_GAP'] });
    const locked = exchangeSubmitState({ selected, acked: [], submitting: false });
    expect(locked.disabled).toBe(true);
    expect(locked.hint).toBe('Hãy đọc và tick xác nhận cảnh báo trước khi gửi.');
    expect(exchangeSubmitState({ selected, acked: ['WEIGHT_GAP'], submitting: false })).toEqual({ disabled: false, hint: null });
  });

  it('ca không hợp lệ không gửi được; đang gửi thì khóa', () => {
    expect(exchangeSubmitState({ selected: option({ valid: false }), acked: [], submitting: false }).disabled).toBe(true);
    expect(exchangeSubmitState({ selected: option(), acked: [], submitting: true }).disabled).toBe(true);
  });
});

describe('rewardInput', () => {
  it('bỏ trống là không có tiền (quà suông)', () => {
    expect(rewardInput('')).toEqual({ amount: null, error: null });
    expect(rewardInput('   ')).toEqual({ amount: null, error: null });
  });

  it('nhận số có dấu chấm ngăn nghìn và chữ đ', () => {
    expect(rewardInput('30000')).toEqual({ amount: 30000, error: null });
    expect(rewardInput('30.000')).toEqual({ amount: 30000, error: null });
    expect(rewardInput('30.000đ')).toEqual({ amount: 30000, error: null });
    expect(rewardInput('500.000')).toEqual({ amount: 500000, error: null });
  });

  it('chỉ nhận bội của 1.000 trong [1.000, 500.000]', () => {
    for (const bad of ['999', '1500', '500001', '0', '600.000']) {
      expect(rewardInput(bad), bad).toEqual({ amount: null, error: 'Quà từ 1.000đ đến 500.000đ.' });
    }
  });

  it('không phải số thì báo lỗi', () => {
    expect(rewardInput('abc').error).toBe('Quà từ 1.000đ đến 500.000đ.');
    expect(rewardInput('12a').error).toBe('Quà từ 1.000đ đến 500.000đ.');
  });
});

describe('exchangeBody', () => {
  it('đủ trường, bỏ lời nhắn / lý do rỗng, kèm các cảnh báo đã tick', () => {
    const body = exchangeBody({ fromAssignmentId: 'a2', option: option({ warnings: ['WEIGHT_GAP'] }), acked: ['WEIGHT_GAP'], note: '  Cảm ơn nhé  ', reason: '' });
    expect(body).toEqual({ type: 'EXCHANGE', fromAssignmentId: 'a2', toAssignmentId: 'a3', note: 'Cảm ơn nhé', acknowledgedWarnings: ['WEIGHT_GAP'] });
  });
});

describe('coverBody', () => {
  it('nhờ đích danh làm bù: không có tiền, không có ghi chú quà', () => {
    const body = coverBody({ fromAssignmentId: 'a8', targetMemberId: 'm3', compensation: 'PAYBACK', rewardText: '30000', rewardNote: 'Bao trà', note: '', reason: 'Bận', acked: [] });
    expect(body).toEqual({ type: 'COVER', fromAssignmentId: 'a8', targetMemberId: 'm3', compensation: 'PAYBACK', reason: 'Bận', acknowledgedWarnings: [] });
  });

  it('Chợ ca kèm quà: không có targetMemberId, có số tiền và ghi chú', () => {
    const body = coverBody({ fromAssignmentId: 'a7', targetMemberId: null, compensation: 'GIFT', rewardText: '30.000', rewardNote: ' Bao 1 ly trà sữa ', note: '', reason: '', acked: ['DUE_SOON'] });
    expect(body).toEqual({
      type: 'COVER',
      fromAssignmentId: 'a7',
      compensation: 'GIFT',
      rewardAmount: 30000,
      rewardNote: 'Bao 1 ly trà sữa',
      acknowledgedWarnings: ['DUE_SOON'],
    });
  });

  it('quà suông: không có rewardAmount', () => {
    const body = coverBody({ fromAssignmentId: 'a7', targetMemberId: null, compensation: 'GIFT', rewardText: '', rewardNote: 'Cảm ơn', note: '', reason: '', acked: [] });
    expect(body).not.toHaveProperty('rewardAmount');
    expect(body.rewardNote).toBe('Cảm ơn');
  });

  it('lời nhắn chỉ đi kèm yêu cầu đích danh (Chợ ca không hiện lời nhắn)', () => {
    expect(coverBody({ fromAssignmentId: 'a', targetMemberId: 'm', compensation: 'GIFT', rewardText: '', rewardNote: '', note: 'Nhờ bạn', reason: '', acked: [] }).note).toBe('Nhờ bạn');
    expect(coverBody({ fromAssignmentId: 'a', targetMemberId: null, compensation: 'GIFT', rewardText: '', rewardNote: '', note: 'Nhờ bạn', reason: '', acked: [] })).not.toHaveProperty('note');
  });
});
