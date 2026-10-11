import { describe, expect, it } from 'vitest';
import { auditText, defaultRotationMode, describeChore, upcomingSlots } from './chore-text.ts';
import type { Assignment, AuditLog, Chore } from './types.ts';

const chore = (over: Partial<Chore> = {}): Chore => ({
  id: 'c1',
  title: 'Đổ rác',
  weight: 2,
  frequency: 'WEEKLY',
  recurrenceDays: [1, 4],
  dueTime: '21:00',
  rotationMode: 'WEEK_BLOCK',
  occurrenceGap: 1,
  isActive: true,
  ...over,
});

describe('describeChore', () => {
  it('mô tả lịch lặp và giờ hạn', () => {
    expect(describeChore(chore())).toBe('T2, T5 · hạn 21:00');
    expect(describeChore(chore({ frequency: 'DAILY', recurrenceDays: [1, 2, 3, 4, 5, 6, 7], dueTime: '22:30' }))).toBe('Hằng ngày · hạn 22:30');
    expect(describeChore(chore({ frequency: 'ADHOC', recurrenceDays: [] }))).toBe('Đột xuất');
    expect(describeChore(chore({ recurrenceDays: [7] }))).toBe('CN · hạn 21:00');
  });
});

describe('defaultRotationMode', () => {
  it('lặp từ 3 ngày/tuần trở lên mặc định PER_OCCURRENCE, còn lại WEEK_BLOCK', () => {
    expect(defaultRotationMode('DAILY', [])).toBe('PER_OCCURRENCE');
    expect(defaultRotationMode('WEEKLY', [1, 3, 5])).toBe('PER_OCCURRENCE');
    expect(defaultRotationMode('WEEKLY', [1, 3])).toBe('WEEK_BLOCK');
    expect(defaultRotationMode('ADHOC', [])).toBe('WEEK_BLOCK');
  });
});

describe('auditText', () => {
  const log = (action: string, over: Partial<AuditLog> = {}): AuditLog => ({
    id: 'l1',
    action,
    actorId: 'm1',
    actorName: 'Trần Minh Hùng',
    assignmentId: null,
    scheduleId: null,
    detail: {},
    createdAt: '2026-10-11T10:00:00Z',
    ...over,
  });

  it('câu tiếng Việt có tên người thao tác', () => {
    expect(auditText(log('REROLL'))).toBe('Hùng đã xáo lại lịch tuần.');
    expect(auditText(log('CHORE_CREATED', { detail: { title: 'Lau bếp' } }))).toBe('Hùng đã thêm việc "Lau bếp".');
    expect(auditText(log('OVERRIDE_FORCE_DONE', { detail: { reason: 'Đã xem ảnh' } }))).toBe('Hùng xác nhận hoàn thành một ca: Đã xem ảnh');
    expect(auditText(log('APPEAL'))).toBe('Hùng khiếu nại một ca bị từ chối.');
  });

  it('thao tác của hệ thống (không có người) ghi là "Hệ thống"', () => {
    expect(auditText(log('AUTO_APPROVE', { actorId: null, actorName: null }))).toBe('Hệ thống tự duyệt một ca sau 48 giờ không ai duyệt.');
    expect(auditText(log('ORPHAN_REASSIGN', { actorId: null, actorName: null }))).toBe('Hệ thống giao lại một ca của người đã rời nhà.');
  });

  it('mã lạ thì hiện mã gốc thay vì ẩn', () => {
    expect(auditText(log('SOMETHING_NEW'))).toBe('Hùng: SOMETHING_NEW');
  });
});

describe('upcomingSlots', () => {
  const slot = (over: Partial<Assignment>): Assignment =>
    ({ id: 'a', choreId: 'c1', status: 'TODO', dueAt: '2026-10-12T14:00:00Z', ...over }) as Assignment;
  const now = new Date('2026-10-10T00:00:00Z');

  it('đếm ca chưa làm trong tương lai của đúng việc đó (các ca sẽ bị hủy khi tắt việc)', () => {
    const list = [
      slot({ id: '1' }),
      slot({ id: '2', status: 'UNASSIGNED' }),
      slot({ id: '3', status: 'DONE' }),
      slot({ id: '4', choreId: 'c2' }),
      slot({ id: '5', dueAt: '2026-10-09T14:00:00Z' }),
      slot({ id: '6', status: 'PENDING_VERIFY' }),
    ];
    expect(upcomingSlots(list, 'c1', now)).toBe(2);
  });
});
