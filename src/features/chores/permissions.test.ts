import { describe, expect, it } from 'vitest';
import { canAppeal, canCheckin, canVerify, overrideActions } from './permissions.ts';
import type { Assignment } from './types.ts';

// "Bây giờ" = Thứ Tư 07.10.2026 10:00 giờ VN. Ca hạn 21:00 cùng ngày, ân hạn 3 giờ.
const NOW = new Date('2026-10-07T03:00:00Z');
const make = (over: Partial<Assignment> = {}): Assignment => ({
  id: 'a1',
  choreId: 'c1',
  choreTitle: 'Đổ rác',
  weight: 2,
  assigneeId: 'm-thien',
  originalAssigneeId: 'm-thien',
  assigneeUserId: 'u-thien',
  assigneeName: 'Thiện',
  assigneeAvatarUrl: null,
  weekKey: '2026-W41',
  weekStart: '2026-10-05',
  occurrenceDate: '2026-10-07',
  slotIndex: 0,
  dueAt: '2026-10-07T14:00:00.000Z',
  status: 'TODO',
  source: 'ROTATION',
  wheelSpinId: null,
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

describe('canCheckin', () => {
  it('người được giao, ca Chờ làm hoặc Làm lại, trong cửa sổ [00:00 ngày làm, hạn + ân hạn]', () => {
    expect(canCheckin(make(), 'u-thien', NOW, 3)).toBe(true);
    expect(canCheckin(make({ status: 'REJECTED' }), 'u-thien', NOW, 3)).toBe(true);
  });

  it('chưa tới ngày làm thì chưa nộp được (S-59)', () => {
    expect(canCheckin(make({ occurrenceDate: '2026-10-08', dueAt: '2026-10-08T14:00:00.000Z' }), 'u-thien', NOW, 3)).toBe(false);
  });

  it('quá hạn nhưng còn trong ân hạn thì vẫn nộp được (S-60); quá cả ân hạn thì không', () => {
    const justAfterDue = new Date('2026-10-07T15:30:00Z'); // 22:30 VN, quá hạn 1,5 giờ
    expect(canCheckin(make(), 'u-thien', justAfterDue, 3)).toBe(true);
    const pastGrace = new Date('2026-10-07T17:30:00Z'); // 00:30 hôm sau, quá hạn 3,5 giờ
    expect(canCheckin(make(), 'u-thien', pastGrace, 3)).toBe(false);
    expect(canCheckin(make(), 'u-thien', justAfterDue, 1)).toBe(false);
  });

  it('người khác, chưa đăng nhập, ca đã nộp / xong / hủy / disputed thì không', () => {
    expect(canCheckin(make(), 'u-hung', NOW, 3)).toBe(false);
    expect(canCheckin(make(), undefined, NOW, 3)).toBe(false);
    for (const status of ['PENDING_VERIFY', 'DONE', 'MISSED', 'CANCELLED', 'UNASSIGNED'] as const) {
      expect(canCheckin(make({ status }), 'u-thien', NOW, 3), status).toBe(false);
    }
    expect(canCheckin(make({ status: 'REJECTED', disputed: true }), 'u-thien', NOW, 3)).toBe(false);
  });
});

describe('canVerify', () => {
  it('thành viên khác duyệt được ca đang chờ duyệt', () => {
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), 'u-hung')).toBe(true);
  });

  it('không tự duyệt ca của chính mình', () => {
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), 'u-thien')).toBe(false);
  });

  it('ca không ở trạng thái chờ duyệt, hoặc chưa đăng nhập thì không', () => {
    for (const status of ['TODO', 'DONE', 'REJECTED', 'MISSED'] as const) {
      expect(canVerify(make({ status }), 'u-hung'), status).toBe(false);
    }
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), undefined)).toBe(false);
  });
});

describe('canAppeal', () => {
  it('chỉ người làm, ca đang bị từ chối và chưa disputed', () => {
    expect(canAppeal(make({ status: 'REJECTED' }), 'u-thien')).toBe(true);
    expect(canAppeal(make({ status: 'REJECTED' }), 'u-hung')).toBe(false);
    expect(canAppeal(make({ status: 'REJECTED', disputed: true }), 'u-thien')).toBe(false);
    expect(canAppeal(make({ status: 'TODO' }), 'u-thien')).toBe(false);
  });
});

describe('overrideActions (Admin)', () => {
  it('thành viên thường không có hành động nào', () => {
    expect(overrideActions(make({ status: 'MISSED' }), { isAdmin: false, meUserId: 'u-hung' })).toEqual([]);
  });

  it('theo trạng thái ca', () => {
    const admin = { isAdmin: true, meUserId: 'u-hung' };
    expect(overrideActions(make({ status: 'PENDING_VERIFY' }), admin)).toEqual(['FORCE_DONE', 'FORCE_REJECT', 'CANCEL']);
    expect(overrideActions(make({ status: 'REJECTED' }), admin)).toEqual(['FORCE_DONE', 'REASSIGN', 'CANCEL']);
    expect(overrideActions(make({ status: 'MISSED' }), admin)).toEqual(['FORCE_DONE', 'REASSIGN', 'CANCEL']);
    expect(overrideActions(make({ status: 'TODO' }), admin)).toEqual(['REASSIGN', 'CANCEL']);
    expect(overrideActions(make({ status: 'UNASSIGNED', assigneeUserId: null }), admin)).toEqual(['REASSIGN', 'CANCEL']);
    expect(overrideActions(make({ status: 'DONE' }), admin)).toEqual(['FORCE_REJECT']);
    expect(overrideActions(make({ status: 'CANCELLED' }), admin)).toEqual([]);
  });

  it('Admin không FORCE_DONE được ca của chính mình', () => {
    const own = make({ status: 'MISSED', assigneeUserId: 'u-hung' });
    expect(overrideActions(own, { isAdmin: true, meUserId: 'u-hung' })).toEqual(['REASSIGN', 'CANCEL']);
  });
});
