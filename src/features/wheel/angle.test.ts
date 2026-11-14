import { describe, expect, it } from 'vitest';
import { easeOutCubic, sliceAtPointer, spinProgress, totalRotation, wheelAngle } from './angle.ts';

describe('easeOutCubic', () => {
  it('0 → 0, 1 → 1, tăng dần', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5);
  });
});

describe('totalRotation', () => {
  it('ít nhất 5 vòng và kim dừng đúng lát landingIndex với mọi seed', () => {
    for (const n of [8, 9, 10]) {
      for (let landing = 0; landing < n; landing++) {
        for (const seed of [1, 42, 771204, 2 ** 31 - 2]) {
          const total = totalRotation(n, landing, seed);
          expect(total).toBeGreaterThanOrEqual(5 * 360);
          expect(sliceAtPointer(total, n)).toBe(landing);
        }
      }
    }
  });

  it('lệch nhỏ trong lát theo seed, không chạm biên lát', () => {
    const n = 8;
    const w = 360 / n;
    const a = totalRotation(n, 3, 1) % 360;
    const b = totalRotation(n, 3, 2) % 360;
    expect(a).not.toBe(b);
    const center = (360 - (3 + 0.5) * w + 360) % 360;
    for (const seed of [1, 2, 3, 99]) {
      const off = Math.abs(((totalRotation(n, 3, seed) % 360) - center + 540) % 360 - 180);
      expect(off).toBeLessThan(w / 2);
    }
  });
});

describe('T-FE-01: wheelAngle(t)', () => {
  const start = 1_000_000;
  const duration = 6000;
  const total = totalRotation(9, 6, 771204);

  it('t = startAt → 0; trước startAt vẫn 0', () => {
    expect(wheelAngle(start, start, duration, total)).toBe(0);
    expect(wheelAngle(start - 500, start, duration, total)).toBe(0);
  });

  it('t ≥ startAt + duration → đúng tổng góc, kim ở tâm lát landingIndex', () => {
    expect(wheelAngle(start + duration, start, duration, total)).toBe(total);
    expect(wheelAngle(start + duration + 10_000, start, duration, total)).toBe(total);
    expect(sliceAtPointer(wheelAngle(start + duration, start, duration, total), 9)).toBe(6);
  });

  it('đơn điệu tăng theo thời gian', () => {
    let prev = -1;
    for (let t = start; t <= start + duration; t += 50) {
      const a = wheelAngle(t, start, duration, total);
      expect(a).toBeGreaterThanOrEqual(prev);
      prev = a;
    }
  });

  it('là hàm thuần của thời gian: tab ẩn rồi hiện / vào muộn đều ra cùng góc', () => {
    const t = start + 2345;
    expect(wheelAngle(t, start, duration, total)).toBe(wheelAngle(t, start, duration, total));
    expect(spinProgress(t, start, duration)).toBeCloseTo(2345 / 6000);
  });
});
