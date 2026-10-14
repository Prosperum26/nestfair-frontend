import { describe, expect, it } from 'vitest';
import { monthKeyOf, monthLabel, monthNumber, monthOverlineOf, shiftMonth } from './month.ts';

describe('month', () => {
  it('monthKeyOf', () => {
    expect(monthKeyOf(new Date(2026, 9, 14))).toBe('2026-10');
    expect(monthKeyOf(new Date(2026, 0, 1))).toBe('2026-01');
  });
  it('shiftMonth qua năm', () => {
    expect(shiftMonth('2026-10', -1)).toBe('2026-09');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
  it('nhãn', () => {
    expect(monthLabel('2026-10')).toBe('Tháng 10.2026');
    expect(monthOverlineOf('2026-09')).toBe('THÁNG 9.2026');
    expect(monthNumber('2026-09')).toBe(9);
  });
});
