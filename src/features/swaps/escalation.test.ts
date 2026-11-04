import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { ESCALATE_NOTE, escalateBody, escalateButtons, recordEscalateError } from './escalation.ts';

describe('escalateButtons khi đang gửi', () => {
  it('khóa cả ba nút để không gửi hai hành động cùng lúc', () => {
    expect(escalateButtons({}, true).every((b) => b.disabled)).toBe(true);
    expect(escalateButtons({}, false).some((b) => b.disabled)).toBe(false);
  });
});

describe('escalateButtons', () => {
  it('ba nút đúng nhãn, theo thứ tự', () => {
    expect(escalateButtons({}).map((b) => [b.action, b.label])).toEqual([
      ['ADD_REWARD', 'Thêm quà và đăng lại'],
      ['RESEND', 'Gửi người khác'],
      ['SELF', 'Tự làm ca này'],
    ]);
  });

  it('không bị chặn thì cả ba nút bấm được', () => {
    expect(escalateButtons({}).every((b) => !b.disabled && b.reason === null)).toBe(true);
  });

  it('còn quá ít thời gian: khóa thêm quà và gửi người khác kèm lý do, tự làm vẫn được', () => {
    const blocked = recordEscalateError({}, new ApiError(422, 'x', 'ESCALATE_TOO_LATE'));
    const buttons = escalateButtons(blocked);
    expect(buttons[0]).toMatchObject({ disabled: true, reason: 'Còn quá ít thời gian để đăng lại. Bạn có thể tự làm ca này.' });
    expect(buttons[1].disabled).toBe(true);
    expect(buttons[2]).toMatchObject({ disabled: false, reason: null });
  });

  it('hết người để gửi thêm: chỉ khóa "Gửi người khác"', () => {
    const buttons = escalateButtons(recordEscalateError({}, new ApiError(422, 'x', 'NO_RESEND_CANDIDATE')));
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[1]).toMatchObject({ disabled: true, reason: 'Không còn ai để gửi thêm. Hãy đăng Chợ ca hoặc tự làm ca này.' });
    expect(buttons[2].disabled).toBe(false);
  });

  it('đã đăng lại đủ số lần: khóa thêm quà và gửi người khác', () => {
    const buttons = escalateButtons(recordEscalateError({}, new ApiError(422, 'x', 'ESCALATE_LIMIT')));
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[1].disabled).toBe(true);
  });

  it('lỗi khác không khóa nút nào', () => {
    const state = recordEscalateError({}, new ApiError(422, 'x', 'REWARD_NOT_INCREASED'));
    expect(escalateButtons(state).every((b) => !b.disabled)).toBe(true);
  });
});

describe('ESCALATE_NOTE', () => {
  it('nhắc rằng không chọn gì thì ca vẫn là của bạn', () => {
    expect(ESCALATE_NOTE).toBe('Không chọn gì thì ca vẫn là của bạn.');
  });
});

describe('escalateBody', () => {
  it('thêm quà: số tiền hợp lệ và ghi chú', () => {
    expect(escalateBody('ADD_REWARD', { amountText: '50.000', note: ' Bao thêm bánh ' })).toEqual({
      ok: true,
      body: { action: 'ADD_REWARD', rewardAmount: 50000, rewardNote: 'Bao thêm bánh' },
    });
  });

  it('thêm quà chỉ có lời nhắn mới cũng được', () => {
    expect(escalateBody('ADD_REWARD', { amountText: '', note: 'Bao ly cà phê' })).toEqual({ ok: true, body: { action: 'ADD_REWARD', rewardNote: 'Bao ly cà phê' } });
  });

  it('thêm quà mà không có gì: báo lỗi tiếng Việt', () => {
    expect(escalateBody('ADD_REWARD', { amountText: '', note: '' })).toEqual({ ok: false, error: 'Hãy nhập số tiền quà hoặc một lời nhắn mới.' });
  });

  it('số tiền sai: báo lỗi khoảng quà', () => {
    expect(escalateBody('ADD_REWARD', { amountText: '999', note: '' })).toEqual({ ok: false, error: 'Quà từ 1.000đ đến 500.000đ.' });
  });

  it('gửi người khác và tự làm không cần gì thêm', () => {
    expect(escalateBody('RESEND', { amountText: '', note: '' })).toEqual({ ok: true, body: { action: 'RESEND' } });
    expect(escalateBody('SELF', { amountText: '', note: '' })).toEqual({ ok: true, body: { action: 'SELF' } });
  });
});
