import { describe, expect, it } from 'vitest';
import { buildCalendarRows, groupByDay, mergeAssignments, myShiftsToday, onCalendar, waitingForReview } from './grouping.ts';
import type { Assignment } from './types.ts';

const make = (o: Partial<Assignment>): Assignment =>
  ({
    id: 'a',
    choreId: 'c',
    choreTitle: 'Đổ rác',
    weight: 2,
    assigneeUserId: 'u1',
    status: 'TODO',
    source: 'ROTATION',
    occurrenceDate: '2026-10-21',
    dueAt: '2026-10-21T14:00:00.000Z',
    ...o,
  }) as Assignment;

const wheel = (o: Partial<Assignment>) => make({ source: 'WHEEL', choreId: 'sys', choreTitle: 'Mua nước bình 20L', weight: 1, ...o });

describe('Lịch tuần không có ca vòng quay', () => {
  const week = '2026-W43';
  const list = [make({ id: 'r1' }), make({ id: 'r2', assigneeUserId: 'u2' }), wheel({ id: 'w1' }), wheel({ id: 'w2', occurrenceDate: '2026-10-22' })];

  it('onCalendar bỏ mọi ca source = WHEEL', () => {
    expect(onCalendar(list).map((a) => a.id)).toEqual(['r1', 'r2']);
  });

  it('không có hàng việc đột xuất, và số ca mỗi ngày (dùng cho "+N") không đếm ca WHEEL', () => {
    const visible = onCalendar(list);
    expect(buildCalendarRows(visible, week).map((r) => r.choreId)).toEqual(['c']);
    const byDay = groupByDay(visible, week);
    expect(byDay['2026-10-21']).toHaveLength(2);
    expect(byDay['2026-10-22']).toHaveLength(0);
  });
});

describe('Ca vòng quay ở "Việc của bạn hôm nay"', () => {
  // 08:00 giờ VN ngày 22.10, ca quay tối 21.10 hạn "ngày mai 21:00" (14:00Z 22.10).
  const now = new Date('2026-10-22T01:00:00Z');
  const carried = wheel({ id: 'w-yesterday', occurrenceDate: '2026-10-21', dueAt: '2026-10-22T14:00:00.000Z' });

  it('ca WHEEL của mình còn mở vẫn hiện dù occurrenceDate là hôm qua', () => {
    expect(myShiftsToday([carried], 'u1', now).map((a) => a.id)).toEqual(['w-yesterday']);
  });

  it('ca WHEEL đã nộp (chờ duyệt) của mình vẫn hiện để theo dõi', () => {
    expect(myShiftsToday([{ ...carried, status: 'PENDING_VERIFY' }], 'u1', now)).toHaveLength(1);
  });

  it('không hiện khi đã xong, đã hủy, đã quá hạn + ân hạn, hoặc là ca của người khác', () => {
    const late = new Date('2026-10-22T18:00:00Z'); // quá 14:00Z + 3 giờ ân hạn
    expect(myShiftsToday([{ ...carried, status: 'DONE' }], 'u1', now)).toEqual([]);
    expect(myShiftsToday([{ ...carried, status: 'CANCELLED' }], 'u1', now)).toEqual([]);
    expect(myShiftsToday([carried], 'u1', late)).toEqual([]);
    expect(myShiftsToday([carried], 'u2', now)).toEqual([]);
  });

  it('ca thường của hôm qua vẫn không hiện; gộp hai tuần không bị trùng', () => {
    const rotationYesterday = make({ id: 'r-yesterday', occurrenceDate: '2026-10-21' });
    expect(myShiftsToday([rotationYesterday, carried, carried], 'u1', now).map((a) => a.id)).toEqual(['w-yesterday']);
    expect(mergeAssignments([carried], [carried, rotationYesterday])).toHaveLength(2);
  });
});

describe('Ca vòng quay đã nộp vào "Chờ bạn duyệt"', () => {
  const submitted = wheel({ id: 'w-pending', assigneeUserId: 'u-quan', status: 'PENDING_VERIFY' });

  it('người khác thấy để duyệt; người trúng không tự duyệt được', () => {
    expect(waitingForReview([submitted, make({ id: 'r-todo' })], 'u-hung').map((a) => a.id)).toEqual(['w-pending']);
    expect(waitingForReview([submitted], 'u-quan')).toEqual([]);
  });
});
