import { describe, expect, it } from 'vitest';
import { canForgive, canPick, closedLabel, deadlineNote, groupTitle, paybackNotice, phaseLabel, relationOf } from './debts.ts';
import type { Debt, DebtGroup } from './types.ts';

const NOW = new Date('2026-10-26T13:00:00Z'); // 20:00 giờ nhà, 26.10

const debt = (over: Partial<Debt> = {}): Debt => ({
  id: 'd1',
  debtorMemberId: 'mDebtor',
  debtorName: 'Phạm Ngọc Mai',
  creditorMemberId: 'mCreditor',
  creditorName: 'Nguyễn Minh Quân',
  weight: 3,
  status: 'OPEN',
  closeReason: null,
  settledAt: null,
  phase: 'WAITING_COVER',
  coverAssignment: null,
  pickOpensAt: null,
  pickDeadlineAt: null,
  pickAttempts: 0,
  paybackAssignmentId: null,
  createdAt: '2026-10-20T03:00:00Z',
  ...over,
});

const group = (over: Partial<DebtGroup> = {}): DebtGroup => ({
  debtorMemberId: 'mDebtor',
  debtorName: 'Phạm Ngọc Mai',
  creditorMemberId: 'mCreditor',
  creditorName: 'Nguyễn Minh Quân',
  openWeight: 3,
  debts: [debt()],
  ...over,
});

describe('relationOf / groupTitle', () => {
  it('bạn là người nợ', () => {
    expect(relationOf(group(), 'Phạm Ngọc Mai')).toBe('DEBTOR');
    expect(groupTitle(group(), 'Phạm Ngọc Mai')).toBe('Bạn nợ Quân');
  });

  it('bạn là người được nợ', () => {
    expect(relationOf(group(), 'Nguyễn Minh Quân')).toBe('CREDITOR');
    expect(groupTitle(group(), 'Nguyễn Minh Quân')).toBe('Mai nợ bạn');
  });

  it('người ngoài cuộc (scope all)', () => {
    expect(relationOf(group(), 'Trần Minh Hùng')).toBe('OTHER');
    expect(groupTitle(group(), 'Trần Minh Hùng')).toBe('Mai nợ Quân');
  });

  it('hai chiều giữa cùng hai người là hai tiêu đề khác nhau', () => {
    const reverse = group({ debtorMemberId: 'mCreditor', debtorName: 'Nguyễn Minh Quân', creditorMemberId: 'mDebtor', creditorName: 'Phạm Ngọc Mai' });
    expect(groupTitle(group(), 'Phạm Ngọc Mai')).toBe('Bạn nợ Quân');
    expect(groupTitle(reverse, 'Phạm Ngọc Mai')).toBe('Quân nợ bạn');
  });
});

describe('phaseLabel (nợ OPEN)', () => {
  it('chờ ca gốc hoàn thành', () => {
    expect(phaseLabel(debt())).toBe('Chờ ca gốc hoàn thành');
  });

  it('chờ lịch tuần sau', () => {
    expect(phaseLabel(debt({ phase: 'WAITING_SCHEDULE' }))).toBe('Chờ lịch tuần sau');
  });

  it('cửa sổ chọn bù: cần chọn trước giờ nào (giờ nhà)', () => {
    // 2026-10-28T13:00:00Z = 20:00 giờ nhà ngày 28.10.
    expect(phaseLabel(debt({ phase: 'PICK_WINDOW', pickDeadlineAt: '2026-10-28T13:00:00Z' }))).toBe('Cần chọn ca bù trước 28.10 20:00');
  });

  it('đã chọn ca bù', () => {
    expect(phaseLabel(debt({ phase: 'PAYBACK_ASSIGNED', paybackAssignmentId: 'a1' }))).toBe('Đã chọn ca bù');
  });
});

describe('closedLabel (nợ đã đóng)', () => {
  it('theo lý do đóng, không hiện mã', () => {
    const cases: [string, string, Debt['status']][] = [
      ['OFFSET', 'Đã cấn trừ', 'PAID'],
      ['STALE', 'Tự tha sau 4 tuần', 'FORGIVEN'],
      ['FORGIVEN_BY_CREDITOR', 'Đã tha nợ', 'FORGIVEN'],
      ['COVER_MISSED', 'Ca gốc không được làm', 'CANCELLED'],
      ['ADMIN_REASSIGN', 'Trưởng phòng đã giao lại ca', 'CANCELLED'],
      ['ABSENT_REASSIGN', 'Ca được dời vì người làm hộ vắng', 'CANCELLED'],
    ];
    for (const [closeReason, label, status] of cases) {
      expect(closedLabel(debt({ status, closeReason })), closeReason).toBe(label);
    }
  });

  it('không có lý do thì theo trạng thái', () => {
    expect(closedLabel(debt({ status: 'PAID' }))).toBe('Đã trả');
    expect(closedLabel(debt({ status: 'FORGIVEN' }))).toBe('Đã tha');
    expect(closedLabel(debt({ status: 'CANCELLED' }))).toBe('Đã hủy');
  });

  it('lý do lạ không lộ mã', () => {
    expect(closedLabel(debt({ status: 'CANCELLED', closeReason: 'SOMETHING_NEW' }))).toBe('Đã hủy');
  });
});

describe('quyền thao tác', () => {
  const picking = debt({ phase: 'PICK_WINDOW' });

  it('chỉ người được nợ chọn ca bù, khi đang trong cửa sổ chọn', () => {
    expect(canPick(picking, 'Nguyễn Minh Quân')).toBe(true);
    expect(canPick(picking, 'Phạm Ngọc Mai')).toBe(false);
    expect(canPick(debt(), 'Nguyễn Minh Quân')).toBe(false);
    expect(canPick(debt({ phase: 'PICK_WINDOW', status: 'PAID' }), 'Nguyễn Minh Quân')).toBe(false);
  });

  it('chỉ người được nợ tha nợ, khi nợ còn mở', () => {
    expect(canForgive(debt(), 'Nguyễn Minh Quân')).toBe(true);
    expect(canForgive(debt(), 'Phạm Ngọc Mai')).toBe(false);
    expect(canForgive(debt({ status: 'PAID' }), 'Nguyễn Minh Quân')).toBe(false);
  });
});

describe('deadlineNote / paybackNotice', () => {
  it('còn bao nhiêu giờ rồi hệ thống tự chọn', () => {
    expect(deadlineNote(debt({ phase: 'PICK_WINDOW', pickDeadlineAt: '2026-10-27T20:00:00Z' }), NOW)).toBe(
      'Còn 31 giờ. Quá hạn, hệ thống tự chọn ca có độ nặng gần nhất.',
    );
  });

  it('đã quá hạn', () => {
    expect(deadlineNote(debt({ phase: 'PICK_WINDOW', pickDeadlineAt: '2026-10-26T12:00:00Z' }), NOW)).toBe('Đã quá hạn, hệ thống sẽ chọn giúp ca có độ nặng gần nhất.');
  });

  it('không có hạn thì không có dòng nhắc', () => {
    expect(deadlineNote(debt(), NOW)).toBeNull();
  });

  it('dòng cảnh báo cố định trong màn chọn ca bù', () => {
    expect(paybackNotice()).toBe('Nếu bạn không chọn, hệ thống sẽ chọn giúp ca có độ nặng gần nhất.');
  });
});
