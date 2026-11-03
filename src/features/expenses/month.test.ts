import { describe, expect, it } from 'vitest';
import { monthKeyOf, monthLabel, monthNumber, monthOverlineOf, parseMonthParam, shiftMonth } from './month.ts';

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

describe('parseMonthParam', () => {
  it('nhận tháng hợp lệ không quá tháng tối đa', () => {
    expect(parseMonthParam('2019-10', '2026-11')).toBe('2019-10');
    expect(parseMonthParam('2026-11', '2026-11')).toBe('2026-11');
  });

  it('bỏ giá trị sai định dạng, tháng 13, hoặc ở tương lai', () => {
    expect(parseMonthParam(null, '2026-11')).toBeNull();
    expect(parseMonthParam('abc', '2026-11')).toBeNull();
    expect(parseMonthParam('2026-13', '2026-11')).toBeNull();
    expect(parseMonthParam('2026-12', '2026-11')).toBeNull();
  });
});
