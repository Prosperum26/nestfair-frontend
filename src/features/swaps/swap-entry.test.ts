import { describe, expect, it } from 'vitest';
import type { Assignment } from '@/features/chores/types.ts';
import { lockedAssignmentIds, swapEntry } from './swap-entry.ts';
import type { Swap } from './types.ts';

const HOUR = 3_600_000;
const NOW = new Date('2026-10-21T03:00:00Z');

const slot = (over: Partial<Assignment> = {}): Assignment =>
  ({
    id: 'a1',
    choreId: 'c1',
    choreTitle: 'Rửa chén',
    weight: 2,
    assigneeId: 'm1',
    originalAssigneeId: 'm1',
    assigneeUserId: 'u1',
    assigneeName: 'Hùng',
    assigneeAvatarUrl: null,
    weekKey: '2026-W43',
    weekStart: '2026-10-19',
    occurrenceDate: '2026-10-23',
    slotIndex: 0,
    dueAt: new Date(NOW.getTime() + 48 * HOUR).toISOString(),
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
  }) as Assignment;

const none = new Set<string>();

describe('swapEntry', () => {
  it('ca TODO của mình, còn xa hạn: mở được cả hai tab', () => {
    expect(swapEntry(slot(), 'u1', NOW, none)).toEqual({ canOpen: true, exchange: null, cover: null, giftOnly: false, blocked: null });
  });

  it('không phải ca của mình, hoặc chưa đăng nhập: không mở', () => {
    expect(swapEntry(slot(), 'u2', NOW, none).canOpen).toBe(false);
    expect(swapEntry(slot(), undefined, NOW, none).canOpen).toBe(false);
  });

  it('chỉ ca TODO mới đổi được', () => {
    for (const status of ['PENDING_VERIFY', 'DONE', 'REJECTED', 'MISSED', 'CANCELLED', 'UNASSIGNED'] as const) {
      expect(swapEntry(slot({ status }), 'u1', NOW, none).canOpen, status).toBe(false);
    }
  });

  it('ca đã quá hạn không đổi được', () => {
    const late = slot({ dueAt: new Date(NOW.getTime() - HOUR).toISOString() });
    expect(swapEntry(late, 'u1', NOW, none).canOpen).toBe(false);
  });

  it('ca đang có yêu cầu chờ: khóa kèm nhãn "Đang chờ đổi" và câu giải thích', () => {
    const res = swapEntry(slot(), 'u1', NOW, new Set(['a1']));
    expect(res.canOpen).toBe(false);
    expect(res.blocked).toBe('Ca này đang chờ người khác trả lời.');
  });

  it('còn dưới 90 phút tới hạn: không kịp đổi', () => {
    const soon = slot({ dueAt: new Date(NOW.getTime() + 60 * 60_000).toISOString() });
    const res = swapEntry(soon, 'u1', NOW, none);
    expect(res.canOpen).toBe(false);
    expect(res.blocked).toBe('Còn dưới 90 phút tới hạn, không kịp đổi. Hãy tự làm hoặc nhờ trực tiếp.');
  });

  it('ca làm bù (PAYBACK): không chuyển được', () => {
    const res = swapEntry(slot({ source: 'PAYBACK' }), 'u1', NOW, none);
    expect(res.canOpen).toBe(false);
    expect(res.blocked).toBe('Ca làm bù phải tự làm, không chuyển được.');
  });

  it('ca đang làm hộ (COVER): vẫn đổi được nhưng không nhờ trực dùm tiếp', () => {
    const res = swapEntry(slot({ source: 'COVER' }), 'u1', NOW, none);
    expect(res.canOpen).toBe(true);
    expect(res.exchange).toBeNull();
    expect(res.cover).toBe('Ca này bạn đang làm hộ, không nhờ tiếp được.');
  });

  it('ca vòng quay (WHEEL): không đổi, chỉ nhờ bằng quà', () => {
    const res = swapEntry(slot({ source: 'WHEEL' }), 'u1', NOW, none);
    expect(res.canOpen).toBe(true);
    expect(res.exchange).toBe('Việc đột xuất chỉ nhờ được bằng quà.');
    expect(res.cover).toBeNull();
    expect(res.giftOnly).toBe(true);
  });

  it('ca đổi (SWAP) và giao lại (REASSIGN) như ca thường', () => {
    for (const source of ['SWAP', 'REASSIGN'] as const) {
      expect(swapEntry(slot({ source }), 'u1', NOW, none), source).toMatchObject({ canOpen: true, exchange: null, cover: null });
    }
  });
});

describe('lockedAssignmentIds', () => {
  const swap = (over: Partial<Swap>): Swap =>
    ({ id: 's', status: 'PENDING', fromAssignment: null, toAssignment: null, ...over }) as Swap;

  it('gom ca nguồn và ca đích của các yêu cầu đang chờ', () => {
    const ids = lockedAssignmentIds([
      swap({ fromAssignment: { id: 'a1' } as Swap['fromAssignment'], toAssignment: { id: 'a2' } as Swap['toAssignment'] }),
      swap({ fromAssignment: { id: 'a3' } as Swap['fromAssignment'] }),
    ]);
    expect([...ids].sort((a, b) => a.localeCompare(b))).toEqual(['a1', 'a2', 'a3']);
  });

  it('bỏ qua yêu cầu không còn chờ', () => {
    const ids = lockedAssignmentIds([
      swap({ status: 'EXPIRED', fromAssignment: { id: 'a1' } as Swap['fromAssignment'] }),
      swap({ status: 'ACCEPTED', fromAssignment: { id: 'a2' } as Swap['fromAssignment'] }),
    ]);
    expect(ids.size).toBe(0);
  });
});
