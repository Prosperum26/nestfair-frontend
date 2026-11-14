import { describe, expect, it } from 'vitest';
import type { Assignment } from './types.ts';
import { myShiftsToday } from './grouping.ts';

const make = (o: Partial<Assignment>): Assignment =>
  ({ id: 'a', assigneeUserId: 'u1', status: 'TODO', occurrenceDate: '2026-10-11', dueAt: '2026-10-11T14:00:00.000Z', ...o }) as Assignment;

describe('myShiftsToday', () => {
  const today = new Date('2026-10-11T03:00:00Z'); // 10:00 giờ VN
  it('chỉ lấy ca của mình trong ngày, bỏ ca đã hủy, sắp theo hạn', () => {
    const list = [
      make({ id: 'late', dueAt: '2026-10-11T16:00:00.000Z' }),
      make({ id: 'early', dueAt: '2026-10-11T10:00:00.000Z' }),
      make({ id: 'other-user', assigneeUserId: 'u2' }),
      make({ id: 'other-day', occurrenceDate: '2026-10-10' }),
      make({ id: 'cancelled', status: 'CANCELLED' }),
    ];
    expect(myShiftsToday(list, 'u1', today).map((a) => a.id)).toEqual(['early', 'late']);
  });
  it('chưa đăng nhập thì rỗng', () => {
    expect(myShiftsToday([make({})], undefined, today)).toEqual([]);
  });
});
