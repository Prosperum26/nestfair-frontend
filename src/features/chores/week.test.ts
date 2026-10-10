import { describe, expect, it } from 'vitest';
import { dayKeyOf, dueLabel, shiftWeek, weekDays, weekKeyOf, weekRangeLabel } from './week.ts';

describe('dueLabel', () => {
  it('thứ + dd.mm theo giờ VN', () => {
    expect(dueLabel('2026-10-11T16:59:59.999Z')).toBe('CN 11.10');
    expect(dueLabel('2026-10-07T05:00:00Z')).toBe('T4 07.10');
  });
});

describe('weekKeyOf', () => {
  it('đúng ranh giới tuần theo giờ Việt Nam', () => {
    expect(weekKeyOf(new Date('2026-10-11T16:59:59Z'))).toBe('2026-W41');
    expect(weekKeyOf(new Date('2026-10-11T17:00:00Z'))).toBe('2026-W42');
  });

  it('tuần 53 và qua năm', () => {
    expect(weekKeyOf(new Date('2026-12-28T05:00:00Z'))).toBe('2026-W53');
    expect(weekKeyOf(new Date('2027-01-04T05:00:00Z'))).toBe('2027-W01');
  });
});

describe('shiftWeek', () => {
  it('qua ranh giới năm hai chiều', () => {
    expect(shiftWeek('2026-W52', 2)).toBe('2027-W01');
    expect(shiftWeek('2027-W01', -1)).toBe('2026-W53');
    expect(shiftWeek('2026-W41', 1)).toBe('2026-W42');
  });
});

describe('weekDays', () => {
  it('7 ngày bắt đầu từ Thứ Hai, nhãn T2…CN', () => {
    const days = weekDays('2026-W41');
    expect(days.map((d) => d.label)).toEqual(['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']);
    expect(days[0]).toMatchObject({ key: '2026-10-05', day: '05', month: '10' });
    expect(days[6]).toMatchObject({ key: '2026-10-11', day: '11' });
  });
});

describe('dayKeyOf', () => {
  it('quy về ngày theo giờ VN: CN 23:59 VN vẫn là CN', () => {
    expect(dayKeyOf('2026-10-11T16:59:59.999Z')).toBe('2026-10-11');
    expect(dayKeyOf('2026-10-11T17:00:00.000Z')).toBe('2026-10-12');
  });
});

describe('weekRangeLabel', () => {
  it('TUẦN 41 · 05-11.10.2026', () => {
    expect(weekRangeLabel('2026-W41')).toBe('TUẦN 41 · 05-11.10.2026');
  });

  it('tuần giữa hai tháng ghi cả hai tháng', () => {
    expect(weekRangeLabel('2026-W44')).toBe('TUẦN 44 · 26.10-01.11.2026');
  });
});
