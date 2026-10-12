import type { Assignment, AssignmentStatus, OverrideAction } from './types.ts';

const HOUR = 3_600_000;
const VN_OFFSET_MS = 7 * HOUR;

/** 00:00 giờ VN của ngày "YYYY-MM-DD": lúc mở cửa sổ check-in. */
function openAt(day: string): number {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d) - VN_OFFSET_MS;
}

/**
 * Người được giao nộp ảnh: ca Chờ làm / Làm lại, chưa disputed, trong cửa sổ
 * [00:00 ngày làm, hạn + ân hạn]. Backend vẫn kiểm tra lại theo giờ server.
 */
export function canCheckin(a: Assignment, meUserId: string | undefined, now: Date, graceHours: number): boolean {
  if (!meUserId || a.assigneeUserId !== meUserId) return false;
  if (a.status !== 'TODO' && a.status !== 'REJECTED') return false;
  if (a.disputed) return false;
  const t = now.getTime();
  return t >= openAt(a.occurrenceDate) && t <= new Date(a.dueAt).getTime() + graceHours * HOUR;
}

/** Thành viên khác (không phải người làm) duyệt ca đang chờ duyệt. Không tự duyệt ca của mình. */
export function canVerify(a: Assignment, meUserId: string | undefined): boolean {
  return !!meUserId && a.assigneeUserId !== meUserId && a.status === 'PENDING_VERIFY';
}

/** Người làm khiếu nại khi ca đang bị từ chối và chưa chuyển cho trưởng phòng. */
export function canAppeal(a: Assignment, meUserId: string | undefined): boolean {
  return !!meUserId && a.assigneeUserId === meUserId && a.status === 'REJECTED' && !a.disputed;
}

/** Trạng thái xuất phát hợp lệ của từng hành động override (khớp backend). */
const OVERRIDE_FROM: Record<OverrideAction, AssignmentStatus[]> = {
  FORCE_DONE: ['PENDING_VERIFY', 'REJECTED', 'MISSED'],
  FORCE_REJECT: ['PENDING_VERIFY', 'DONE'],
  REASSIGN: ['TODO', 'UNASSIGNED', 'REJECTED', 'MISSED'],
  CANCEL: ['TODO', 'UNASSIGNED', 'REJECTED', 'MISSED', 'PENDING_VERIFY'],
};
const OVERRIDE_ORDER: OverrideAction[] = ['FORCE_DONE', 'FORCE_REJECT', 'REASSIGN', 'CANCEL'];

/** Hành động trưởng phòng có thể dùng trên một ca. FORCE_DONE bị loại với ca của chính mình. */
export function overrideActions(a: Assignment, who: { isAdmin: boolean; meUserId: string | undefined }): OverrideAction[] {
  if (!who.isAdmin) return [];
  return OVERRIDE_ORDER.filter((action) => OVERRIDE_FROM[action].includes(a.status)).filter(
    (action) => !(action === 'FORCE_DONE' && !!who.meUserId && a.assigneeUserId === who.meUserId),
  );
}
