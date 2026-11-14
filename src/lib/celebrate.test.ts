import { describe, expect, it } from 'vitest';
import { HOLD_MS, holdFor } from './celebrate.ts';

describe('holdFor', () => {
  it('giữ hiệu ứng điểm nhấn theo thời lượng của spec', () => {
    expect(HOLD_MS).toEqual({ verifyStamp: 700, swapAccepted: 600, settled: 900 });
    expect(holdFor('verifyStamp', false)).toBe(700);
    expect(holdFor('swapAccepted', false)).toBe(600);
  });

  it('giảm chuyển động thì không giữ, luồng chạy tiếp ngay', () => {
    expect(holdFor('verifyStamp', true)).toBe(0);
    expect(holdFor('settled', true)).toBe(0);
  });

  it('chưa biết giảm chuyển động (null) thì coi như không bật', () => {
    expect(holdFor('settled', null)).toBe(900);
  });
});
