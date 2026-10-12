import { describe, expect, it } from 'vitest';
import { buildCalendarRows, collapseDay, groupByColumn, groupByDay, prioritizeForMe } from './grouping.ts';
import type { Assignment } from './types.ts';

let seq = 0;
const make = (over: Partial<Assignment> = {}): Assignment => ({
  id: `a${seq++}`,
  choreId: 'c1',
  choreTitle: 'Đổ rác',
  weight: 2,
  assigneeId: 'm1',
  originalAssigneeId: 'm1',
  assigneeUserId: 'u1',
  assigneeName: 'Hùng',
  assigneeAvatarUrl: null,
  weekKey: '2026-W41',
  weekStart: '2026-10-05',
  occurrenceDate: '2026-10-11',
  slotIndex: 0,
  dueAt: '2026-10-11T14:00:00.000Z',
  status: 'TODO',
  source: 'ROTATION',
  proofImageUrl: null,
  submittedAt: null,
  isLate: false,
  rejectCount: 0,
  verifiedById: null,
  verifiedAt: null,
  verifyMode: null,
  rejectReason: null,
  disputed: false,
  ...over,
});

describe('groupByDay', () => {
  it('tuần rỗng vẫn có đủ 7 ngày với mảng rỗng', () => {
    const groups = groupByDay([], '2026-W41');
    expect(Object.keys(groups)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
    expect(Object.values(groups).every((list) => list.length === 0)).toBe(true);
  });

  it('nhóm theo ngày làm (occurrenceDate), giữ thứ tự đầu vào', () => {
    const a = make({ occurrenceDate: '2026-10-08' });
    const b = make({ occurrenceDate: '2026-10-08', choreId: 'c2' });
    const c = make({ occurrenceDate: '2026-10-11' });
    const groups = groupByDay([a, b, c], '2026-W41');
    expect(groups['2026-10-08']).toEqual([a, b]);
    expect(groups['2026-10-11']).toEqual([c]);
    expect(groups['2026-10-09']).toEqual([]);
  });

  it('ca có ngày làm ngoài tuần đang xem bị bỏ qua', () => {
    const groups = groupByDay([make({ occurrenceDate: '2026-10-18' })], '2026-W41');
    expect(Object.values(groups).flat()).toHaveLength(0);
  });
});

describe('buildCalendarRows', () => {
  it('mỗi việc một hàng; việc hằng ngày có đủ 7 ô, việc 1 lần/tuần chỉ có 1 ô', () => {
    const daily = ['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11'].map((d) =>
      make({ choreId: 'dishes', choreTitle: 'Rửa chén', occurrenceDate: d }),
    );
    const weekly = make({ choreId: 'bath', choreTitle: 'Dọn nhà tắm', occurrenceDate: '2026-10-11' });
    const rows = buildCalendarRows([...daily, weekly], '2026-W41');
    expect(rows.map((r) => r.title)).toEqual(['Rửa chén', 'Dọn nhà tắm']);
    expect(Object.values(rows[0].cells).filter((c) => c.length > 0)).toHaveLength(7);
    expect(Object.values(rows[1].cells).filter((c) => c.length > 0)).toHaveLength(1);
    expect(rows[1].cells['2026-10-11']).toEqual([weekly]);
  });

  it('thứ tự hàng theo ngày làm đầu tiên rồi theo tên', () => {
    const rows = buildCalendarRows(
      [
        make({ choreId: 'b', choreTitle: 'B', occurrenceDate: '2026-10-09' }),
        make({ choreId: 'a', choreTitle: 'A', occurrenceDate: '2026-10-09' }),
        make({ choreId: 'c', choreTitle: 'C', occurrenceDate: '2026-10-06' }),
      ],
      '2026-W41',
    );
    expect(rows.map((r) => r.title)).toEqual(['C', 'A', 'B']);
  });

  it('một việc có nhiều ca trong cùng ngày xếp chồng trong một ô', () => {
    const a = make({ occurrenceDate: '2026-10-08', slotIndex: 0 });
    const b = make({ occurrenceDate: '2026-10-08', slotIndex: 1, assigneeUserId: 'u2' });
    expect(buildCalendarRows([a, b], '2026-W41')[0].cells['2026-10-08']).toEqual([a, b]);
  });
});

describe('groupByColumn', () => {
  it('5 cột Kanban; Chưa có người và Đã hủy nằm ở hộp riêng', () => {
    const todo = make({ status: 'TODO' });
    const pending = make({ status: 'PENDING_VERIFY' });
    const rejected = make({ status: 'REJECTED' });
    const done = make({ status: 'DONE' });
    const missed = make({ status: 'MISSED' });
    const unassigned = make({ status: 'UNASSIGNED', assigneeId: null, assigneeUserId: null });
    const cancelled = make({ status: 'CANCELLED' });
    expect(groupByColumn([todo, pending, rejected, done, missed, unassigned, cancelled])).toEqual({
      columns: { TODO: [todo], PENDING_VERIFY: [pending], REJECTED: [rejected], DONE: [done], MISSED: [missed] },
      unassigned: [unassigned],
      cancelled: [cancelled],
    });
  });

  it('danh sách rỗng ra đủ các cột rỗng', () => {
    expect(groupByColumn([])).toEqual({
      columns: { TODO: [], PENDING_VERIFY: [], REJECTED: [], DONE: [], MISSED: [] },
      unassigned: [],
      cancelled: [],
    });
  });
});

describe('collapseDay', () => {
  it('rút gọn "+N": hiện tối đa `max` ca, đếm phần còn lại', () => {
    const list = [make(), make(), make(), make(), make()];
    expect(collapseDay(list, 3)).toEqual({ shown: list.slice(0, 3), hidden: 2 });
    expect(collapseDay(list.slice(0, 2), 3)).toEqual({ shown: list.slice(0, 2), hidden: 0 });
  });

  it('mở rộng thì hiện hết', () => {
    const list = [make(), make(), make(), make()];
    expect(collapseDay(list, 3, true)).toEqual({ shown: list, hidden: 0 });
  });
});

describe('prioritizeForMe', () => {
  it('ca của mình còn việc phải làm và ca cần mình duyệt lên đầu, giữ thứ tự còn lại', () => {
    const done = make({ id: 'done', status: 'DONE', assigneeUserId: 'u2' });
    const other = make({ id: 'other', assigneeUserId: 'u2' });
    const mineTodo = make({ id: 'mineTodo', assigneeUserId: 'u1' });
    const mineRejected = make({ id: 'mineRejected', assigneeUserId: 'u1', status: 'REJECTED' });
    const toVerify = make({ id: 'toVerify', assigneeUserId: 'u2', status: 'PENDING_VERIFY' });
    const mineDone = make({ id: 'mineDone', assigneeUserId: 'u1', status: 'DONE' });
    const out = prioritizeForMe([done, other, mineTodo, mineRejected, toVerify, mineDone], 'u1').map((a) => a.id);
    expect(out).toEqual(['mineTodo', 'mineRejected', 'toVerify', 'done', 'other', 'mineDone']);
  });

  it('không có người dùng thì giữ nguyên thứ tự; không đổi mảng gốc', () => {
    const list = [make({ id: 'a' }), make({ id: 'b' })];
    expect(prioritizeForMe(list, undefined)).toEqual(list);
    const copy = [...list];
    prioritizeForMe(list, 'u1');
    expect(list).toEqual(copy);
  });

  it('kết hợp với collapseDay: ca của mình không bị giấu sau "+N"', () => {
    const others = Array.from({ length: 4 }, (_, i) => make({ id: `o${i}`, assigneeUserId: 'u2' }));
    const mine = make({ id: 'mine', assigneeUserId: 'u1' });
    const { shown } = collapseDay(prioritizeForMe([...others, mine], 'u1'), 3);
    expect(shown.map((a) => a.id)).toContain('mine');
  });
});
