import { describe, expect, it } from 'vitest';
import { countUpFrame } from './count-up.ts';

const steps = (from: number, to: number) => Array.from({ length: 21 }, (_, i) => countUpFrame(from, to, i / 20));

describe('countUpFrame', () => {
  it('bắt đầu đúng giá trị cũ và kết thúc đúng giá trị mới', () => {
    expect(countUpFrame(0, 2_280_000, 0)).toBe(0);
    expect(countUpFrame(0, 2_280_000, 1)).toBe(2_280_000);
  });

  it('luôn là số nguyên VNĐ', () => {
    for (const v of steps(0, 380_001)) expect(Number.isInteger(v)).toBe(true);
  });

  it('đơn điệu theo chiều đếm (tăng hay giảm đều không quay đầu)', () => {
    const up = steps(170_000, 2_280_000);
    for (let i = 1; i < up.length; i++) expect(up[i]).toBeGreaterThanOrEqual(up[i - 1]);
    const down = steps(380_000, 0);
    for (let i = 1; i < down.length; i++) expect(down[i]).toBeLessThanOrEqual(down[i - 1]);
  });

  it('kẹp t ngoài [0, 1]', () => {
    expect(countUpFrame(0, 100, 1.5)).toBe(100);
    expect(countUpFrame(0, 100, -1)).toBe(0);
  });

  it('giữ dấu với số âm (số dư cần trả)', () => {
    expect(countUpFrame(-170_000, 0, 1)).toBe(0);
    expect(countUpFrame(0, -170_000, 1)).toBe(-170_000);
  });
});
