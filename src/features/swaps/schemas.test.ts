import { describe, expect, it } from 'vitest';
import { createCoverSchema, createExchangeSchema, escalateSchema, rewardAmountSchema } from './schemas.ts';

const UUID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301';
const UUID2 = '3f2504e0-4f89-41d3-9a0c-0305e82c3302';

describe('rewardAmountSchema', () => {
  it('nhận bội của 1.000 trong [1.000, 500.000]', () => {
    for (const ok of [1000, 30000, 500000]) expect(rewardAmountSchema.safeParse(ok).success, String(ok)).toBe(true);
  });

  it('từ chối ngoài khoảng, không phải bội của 1.000, hoặc không phải số nguyên', () => {
    for (const bad of [0, 999, 1500, 500001, 600000, -1000, 30000.5]) {
      expect(rewardAmountSchema.safeParse(bad).success, String(bad)).toBe(false);
    }
  });

  it('câu lỗi là tiếng Việt, không có mã', () => {
    const res = rewardAmountSchema.safeParse(999);
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toBe('Quà từ 1.000đ đến 500.000đ.');
  });
});

describe('createExchangeSchema', () => {
  const base = { fromAssignmentId: UUID, toAssignmentId: UUID2 };

  it('nhận dữ liệu tối thiểu', () => {
    expect(createExchangeSchema.safeParse(base).success).toBe(true);
  });

  it('lời nhắn và lý do tối đa 200 ký tự', () => {
    expect(createExchangeSchema.safeParse({ ...base, note: 'a'.repeat(200) }).success).toBe(true);
    expect(createExchangeSchema.safeParse({ ...base, note: 'a'.repeat(201) }).success).toBe(false);
    expect(createExchangeSchema.safeParse({ ...base, reason: 'a'.repeat(201) }).success).toBe(false);
  });

  it('phải chọn ca muốn đổi', () => {
    const res = createExchangeSchema.safeParse({ fromAssignmentId: UUID, toAssignmentId: '' });
    expect(res.success).toBe(false);
    if (!res.success) expect(res.error.issues[0].message).toBe('Hãy chọn ca muốn đổi.');
  });
});

describe('createCoverSchema', () => {
  const base = { fromAssignmentId: UUID };

  it('làm bù không có tiền', () => {
    expect(createCoverSchema.safeParse({ ...base, compensation: 'PAYBACK' }).success).toBe(true);
    expect(createCoverSchema.safeParse({ ...base, compensation: 'PAYBACK', rewardAmount: 30000 }).success).toBe(false);
  });

  it('quà có thể không tiền, hoặc có tiền hợp lệ', () => {
    expect(createCoverSchema.safeParse({ ...base, compensation: 'GIFT' }).success).toBe(true);
    expect(createCoverSchema.safeParse({ ...base, compensation: 'GIFT', rewardAmount: 30000, rewardNote: 'Bao trà sữa' }).success).toBe(true);
    expect(createCoverSchema.safeParse({ ...base, compensation: 'GIFT', rewardAmount: 999 }).success).toBe(false);
  });

  it('ghi chú quà tối đa 100 ký tự', () => {
    expect(createCoverSchema.safeParse({ ...base, compensation: 'GIFT', rewardNote: 'a'.repeat(101) }).success).toBe(false);
  });
});

describe('escalateSchema', () => {
  it('ADD_REWARD cần số tiền hợp lệ hoặc ghi chú mới', () => {
    expect(escalateSchema.safeParse({ action: 'ADD_REWARD', rewardAmount: 50000 }).success).toBe(true);
    expect(escalateSchema.safeParse({ action: 'ADD_REWARD', rewardNote: 'Bao thêm bánh' }).success).toBe(true);
    expect(escalateSchema.safeParse({ action: 'ADD_REWARD' }).success).toBe(false);
    expect(escalateSchema.safeParse({ action: 'ADD_REWARD', rewardAmount: 999 }).success).toBe(false);
  });

  it('RESEND và SELF không cần gì thêm', () => {
    expect(escalateSchema.safeParse({ action: 'RESEND' }).success).toBe(true);
    expect(escalateSchema.safeParse({ action: 'SELF' }).success).toBe(true);
    expect(escalateSchema.safeParse({ action: 'OTHER' }).success).toBe(false);
  });
});
