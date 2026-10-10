import type { Assignment } from './types.ts';

/** Người được giao nộp ảnh: ca Chờ làm / Làm lại và chưa quá hạn. */
export function canCheckin(a: Assignment, meUserId: string | undefined, now: Date = new Date()): boolean {
  return (
    !!meUserId &&
    a.assigneeUserId === meUserId &&
    (a.status === 'TODO' || a.status === 'REJECTED') &&
    new Date(a.dueAt).getTime() >= now.getTime()
  );
}

/** Thành viên khác (không phải người làm) duyệt ca đang chờ duyệt. Không tự duyệt ca của mình. */
export function canVerify(a: Assignment, meUserId: string | undefined): boolean {
  return !!meUserId && a.assigneeUserId !== meUserId && a.status === 'PENDING_VERIFY';
}
