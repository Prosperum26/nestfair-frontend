import { describe, expect, it } from 'vitest';
import { rewardAmountSchema } from './schemas.ts';

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
