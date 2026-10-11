import { firstName } from '@/lib/date.ts';
import type { Assignment, AuditLog, Chore, ChoreFrequency, RotationMode } from './types.ts';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/** "T2, T5 · hạn 21:00" / "Hằng ngày · hạn 22:30" / "Đột xuất". */
export function describeChore(c: Pick<Chore, 'frequency' | 'recurrenceDays' | 'dueTime'>): string {
  if (c.frequency === 'ADHOC') return 'Đột xuất';
  const days = c.frequency === 'DAILY' ? 'Hằng ngày' : [...c.recurrenceDays].sort((a, b) => a - b).map((d) => DAY_LABELS[d - 1]).join(', ');
  return `${days} · hạn ${c.dueTime}`;
}

/** Chế độ xoay mặc định (khớp backend): lặp ≥ 3 ngày/tuần → PER_OCCURRENCE, ngược lại WEEK_BLOCK. */
export function defaultRotationMode(frequency: ChoreFrequency, days: number[]): RotationMode {
  if (frequency === 'ADHOC') return 'WEEK_BLOCK';
  return frequency === 'DAILY' || days.length >= 3 ? 'PER_OCCURRENCE' : 'WEEK_BLOCK';
}

export const ROTATION_HINTS: Record<RotationMode, { label: string; hint: string }> = {
  WEEK_BLOCK: { label: 'Một người cả tuần', hint: 'Một người làm mọi ngày của việc trong tuần; rào 3 tuần để không ai lặp lại.' },
  PER_OCCURRENCE: { label: 'Xoay từng lần', hint: 'Mỗi lần một người, lần sau là người khác; không ai làm hai lần liên tiếp.' },
};

const text = (d: Record<string, unknown>, key: string) => (typeof d[key] === 'string' ? (d[key] as string) : null);

/** Câu tiếng Việt cho một dòng nhật ký thao tác. */
export function auditText(log: AuditLog): string {
  const who = log.actorName ? firstName(log.actorName) : 'Hệ thống';
  const reason = text(log.detail, 'reason');
  switch (log.action) {
    case 'REROLL':
      return `${who} đã xáo lại lịch tuần.`;
    case 'CHORE_CREATED':
      return `${who} đã thêm việc "${text(log.detail, 'title') ?? ''}".`;
    case 'CHORE_UPDATED':
      return `${who} đã sửa một việc.`;
    case 'CHORE_DEACTIVATED':
      return `${who} đã tạm ngưng một việc; các ca chưa làm trong tương lai bị hủy.`;
    case 'CHORE_ACTIVATED':
      return `${who} đã bật lại một việc.`;
    case 'SETTINGS_UPDATED':
      return `${who} đã đổi cài đặt việc nhà.`;
    case 'ABSENCE_CREATED':
      return `${who} đã khai vắng.`;
    case 'ABSENCE_DELETED':
      return `${who} đã xóa một khai vắng.`;
    case 'BREAK_CREATED':
      return `${who} đã đặt khoảng cả nhà vắng.`;
    case 'BREAK_DELETED':
      return `${who} đã xóa một khoảng cả nhà vắng.`;
    case 'APPEAL':
      return `${who} khiếu nại một ca bị từ chối.`;
    case 'OVERRIDE_FORCE_DONE':
      return `${who} xác nhận hoàn thành một ca${reason ? `: ${reason}` : '.'}`;
    case 'OVERRIDE_FORCE_REJECT':
      return `${who} yêu cầu làm lại một ca${reason ? `: ${reason}` : '.'}`;
    case 'OVERRIDE_REASSIGN':
      return `${who} giao lại một ca${reason ? `: ${reason}` : '.'}`;
    case 'OVERRIDE_CANCEL':
      return `${who} hủy một ca${reason ? `: ${reason}` : '.'}`;
    case 'AUTO_APPROVE':
      return `${who} tự duyệt một ca sau 48 giờ không ai duyệt.`;
    case 'ORPHAN_REASSIGN':
      return `${who} giao lại một ca của người đã rời nhà.`;
    case 'ORPHAN_UNASSIGNED':
      return `${who}: một ca của người đã rời nhà chưa tìm được người nhận.`;
    case 'ABSENCE_REASSIGN':
      return `${who} dời một ca sang người khác vì có người vắng.`;
    case 'ABSENCE_UNASSIGNED':
      return `${who}: một ca chưa tìm được người nhận vì có người vắng.`;
    case 'MISSED_STREAK':
      return `${who}: một thành viên đã bỏ 3 ca liên tiếp.`;
    default:
      return `${who}: ${log.action}`;
  }
}

/** Số ca chưa làm (TODO / chưa có người) trong tương lai của một việc: các ca này bị hủy khi tắt việc. */
export function upcomingSlots(assignments: Assignment[], choreId: string, now: Date): number {
  return assignments.filter(
    (a) => a.choreId === choreId && (a.status === 'TODO' || a.status === 'UNASSIGNED') && new Date(a.dueAt).getTime() > now.getTime(),
  ).length;
}
