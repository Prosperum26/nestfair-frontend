import { describe, expect, it } from 'vitest';
import { canCheckin, canVerify } from './permissions.ts';
import type { Assignment } from './types.ts';

const NOW = new Date('2026-10-10T05:00:00Z');
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

describe('canCheckin', () => {
  it('chỉ người được giao, ca Chờ làm hoặc Làm lại, chưa quá hạn', () => {
    expect(canCheckin(make(), 'u-thien', NOW)).toBe(true);
    expect(canCheckin(make({ status: 'REJECTED' }), 'u-thien', NOW)).toBe(true);
  });

  it('người khác không check-in hộ được', () => {
    expect(canCheckin(make(), 'u-hung', NOW)).toBe(false);
  });

  it('ca đã nộp, đã xong, quá hạn hoặc hạn đã qua thì không', () => {
    for (const status of ['PENDING_VERIFY', 'DONE', 'MISSED'] as const) {
      expect(canCheckin(make({ status }), 'u-thien', NOW), status).toBe(false);
    }
    expect(canCheckin(make({ dueAt: '2026-10-10T04:59:59Z' }), 'u-thien', NOW)).toBe(false);
  });

  it('chưa đăng nhập (không có id) thì không', () => {
    expect(canCheckin(make(), undefined, NOW)).toBe(false);
  });
});

describe('canVerify', () => {
  it('thành viên khác duyệt được ca đang chờ duyệt', () => {
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), 'u-hung')).toBe(true);
  });

  it('không tự duyệt ca của chính mình', () => {
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), 'u-thien')).toBe(false);
  });

  it('ca không ở trạng thái chờ duyệt thì không', () => {
    for (const status of ['TODO', 'DONE', 'REJECTED', 'MISSED'] as const) {
      expect(canVerify(make({ status }), 'u-hung'), status).toBe(false);
    }
  });

  it('chưa đăng nhập thì không', () => {
    expect(canVerify(make({ status: 'PENDING_VERIFY' }), undefined)).toBe(false);
  });
});
