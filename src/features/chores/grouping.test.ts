import { describe, expect, it } from 'vitest';
import { groupByDay, groupByStatus } from './grouping.ts';
import type { Assignment } from './types.ts';

let seq = 0;
const make = (over: Partial<Assignment> = {}): Assignment => ({
  id: `a${seq++}`,
  choreId: 'c1',
  choreTitle: 'Đổ rác',
  weight: 2,
  assigneeId: 'm1',
  assigneeUserId: 'u1',
  assigneeName: 'Hùng',
  assigneeAvatarUrl: null,
  weekKey: '2026-W41',
  dueAt: '2026-10-11T16:59:59.999Z',
  status: 'TODO',
  source: 'AUTO',
  proofImageUrl: null,
  submittedAt: null,
  verifiedById: null,
  verifiedAt: null,
  rejectReason: null,
  ...over,
});

describe('groupByDay', () => {
  it('tuần rỗng vẫn có đủ 7 ngày với mảng rỗng', () => {
    const groups = groupByDay([], '2026-W41');
    expect(Object.keys(groups)).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ]);
    expect(Object.values(groups).every((list) => list.length === 0)).toBe(true);
  });

  it('ca hạn Chủ Nhật 23:59 giờ VN nằm đúng cột CN, giữ thứ tự đầu vào', () => {
    const first = make();
    const second = make({ choreId: 'c2' });
    const groups = groupByDay([first, second], '2026-W41');
    expect(groups['2026-10-11']).toEqual([first, second]);
    expect(groups['2026-10-10']).toEqual([]);
  });

  it('ca có hạn ngoài tuần đang xem bị bỏ qua', () => {
    const groups = groupByDay([make({ dueAt: '2026-10-18T10:00:00Z' })], '2026-W41');
    expect(Object.values(groups).flat()).toHaveLength(0);
  });
});

describe('groupByStatus', () => {
  it('REJECTED và MISSED vào cột "Cần xử lý" (ISSUE)', () => {
    const todo = make({ status: 'TODO' });
    const pending = make({ status: 'PENDING_VERIFY' });
    const done = make({ status: 'DONE' });
    const rejected = make({ status: 'REJECTED' });
    const missed = make({ status: 'MISSED' });
    expect(groupByStatus([todo, pending, done, rejected, missed])).toEqual({
      TODO: [todo],
      PENDING_VERIFY: [pending],
      DONE: [done],
      ISSUE: [rejected, missed],
    });
  });

  it('danh sách rỗng ra đủ bốn cột rỗng', () => {
    expect(groupByStatus([])).toEqual({ TODO: [], PENDING_VERIFY: [], DONE: [], ISSUE: [] });
  });
});
