import { describe, expect, it } from 'vitest';
import { dayMonth, groupByDay, localDateOf } from './grouping.ts';
import type { Expense } from './types.ts';

const at = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12).toISOString();
const exp = (id: string, spentAt: string) => ({ id, spentAt }) as Expense;

describe('grouping', () => {
  it('dayMonth và localDateOf', () => {
    expect(dayMonth(at(2026, 10, 5))).toBe('05.10');
    expect(localDateOf(at(2026, 10, 5))).toBe('2026-10-05');
  });

  it('gom theo ngày, giữ thứ tự, nhãn có thứ (05.10.2026 là thứ Hai)', () => {
    const groups = groupByDay([exp('a', at(2026, 10, 5)), exp('b', at(2026, 10, 5)), exp('c', at(2026, 10, 4))]);
    expect(groups.map((g) => [g.label, g.items.map((i) => i.id)])).toEqual([
      ['05.10 · THỨ HAI', ['a', 'b']],
      ['04.10 · CHỦ NHẬT', ['c']],
    ]);
  });

  it('danh sách rỗng', () => {
    expect(groupByDay([])).toEqual([]);
  });
});
