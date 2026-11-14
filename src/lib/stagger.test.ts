import { describe, expect, it } from 'vitest';
import { STAGGER_LIMIT, staggerDelay } from './stagger.ts';

describe('staggerDelay', () => {
  it('mỗi dòng trễ hơn dòng trước 40ms', () => {
    expect(staggerDelay(0)).toBe(0);
    expect(staggerDelay(1)).toBeCloseTo(0.04);
    expect(staggerDelay(5)).toBeCloseTo(0.2);
  });

  it('từ dòng thứ 12 trở đi hiện cùng lúc, hóa đơn dài không phải chờ lâu', () => {
    expect(STAGGER_LIMIT).toBe(12);
    expect(staggerDelay(30)).toBe(staggerDelay(12));
    expect(staggerDelay(12)).toBeCloseTo(0.48);
  });
});
