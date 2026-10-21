import { firstName } from '@/lib/date.ts';
import { houseClock } from '@/lib/house-time.ts';
import type { Debt, DebtGroup } from './types.ts';

/**
 * Backend chưa trả `HouseMember.id` của người đang đăng nhập, nên "mình" được nhận ra bằng họ tên đầy đủ
 * (DTO nợ có `debtorName`/`creditorName`). Quyền thật vẫn do backend kiểm (NOT_CREDITOR).
 */
export type Relation = 'DEBTOR' | 'CREDITOR' | 'OTHER';

export function relationOf(group: Pick<DebtGroup, 'debtorName' | 'creditorName'>, myFullName: string | undefined): Relation {
  if (!myFullName) return 'OTHER';
  if (group.debtorName === myFullName) return 'DEBTOR';
  if (group.creditorName === myFullName) return 'CREDITOR';
  return 'OTHER';
}

/** "Bạn nợ Quân" / "Mai nợ bạn" / "Mai nợ Quân". Hai chiều giữa cùng hai người là hai nhóm, không bù trừ ròng. */
export function groupTitle(group: Pick<DebtGroup, 'debtorName' | 'creditorName'>, myFullName: string | undefined): string {
  const relation = relationOf(group, myFullName);
  if (relation === 'DEBTOR') return `Bạn nợ ${firstName(group.creditorName)}`;
  if (relation === 'CREDITOR') return `${firstName(group.debtorName)} nợ bạn`;
  return `${firstName(group.debtorName)} nợ ${firstName(group.creditorName)}`;
}

/** Trạng thái của một khoản nợ OPEN. */
export function phaseLabel(debt: Debt): string {
  switch (debt.phase) {
    case 'WAITING_COVER':
      return 'Chờ ca gốc hoàn thành';
    case 'WAITING_SCHEDULE':
      return 'Chờ lịch tuần sau';
    case 'PICK_WINDOW': {
      if (!debt.pickDeadlineAt) return 'Cần chọn ca bù';
      const clock = houseClock(debt.pickDeadlineAt);
      return `Cần chọn ca bù trước ${clock.ddmm} ${clock.hm}`;
    }
    case 'PAYBACK_ASSIGNED':
      return 'Đã chọn ca bù';
  }
}

const CLOSED_BY_REASON: Record<string, string> = {
  OFFSET: 'Đã cấn trừ',
  STALE: 'Tự tha sau 4 tuần',
  FORGIVEN_BY_CREDITOR: 'Đã tha nợ',
  COVER_MISSED: 'Ca gốc không được làm',
  ADMIN_REASSIGN: 'Trưởng phòng đã giao lại ca',
  ABSENT_REASSIGN: 'Ca được dời vì người làm hộ vắng',
};
const CLOSED_BY_STATUS: Record<string, string> = { PAID: 'Đã trả', FORGIVEN: 'Đã tha', CANCELLED: 'Đã hủy' };

/** Trạng thái của một khoản nợ đã đóng: theo lý do đóng, không bao giờ hiện mã. */
export function closedLabel(debt: Debt): string {
  if (debt.closeReason && CLOSED_BY_REASON[debt.closeReason]) return CLOSED_BY_REASON[debt.closeReason];
  return CLOSED_BY_STATUS[debt.status] ?? 'Đã đóng';
}

/** Người được nợ chọn ca bù khi nợ còn mở và đang trong cửa sổ chọn. */
export function canPick(debt: Debt, myFullName: string | undefined): boolean {
  return debt.status === 'OPEN' && debt.phase === 'PICK_WINDOW' && !!myFullName && debt.creditorName === myFullName;
}

export function canForgive(debt: Debt, myFullName: string | undefined): boolean {
  return debt.status === 'OPEN' && !!myFullName && debt.creditorName === myFullName;
}

/** "Còn 31 giờ. Quá hạn, hệ thống tự chọn ca có độ nặng gần nhất." (preview 15). */
export function deadlineNote(debt: Debt, now: Date): string | null {
  if (!debt.pickDeadlineAt) return null;
  const left = new Date(debt.pickDeadlineAt).getTime() - now.getTime();
  if (left <= 0) return 'Đã quá hạn, hệ thống sẽ chọn giúp ca có độ nặng gần nhất.';
  return `Còn ${Math.ceil(left / 3_600_000)} giờ. Quá hạn, hệ thống tự chọn ca có độ nặng gần nhất.`;
}

export function paybackNotice(): string {
  return 'Nếu bạn không chọn, hệ thống sẽ chọn giúp ca có độ nặng gần nhất.';
}
