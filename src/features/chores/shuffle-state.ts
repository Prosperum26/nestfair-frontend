import type { ScheduleMeta } from './types.ts';

export const MAX_REROLLS = 2;

export type ShuffleAction =
  | { kind: 'HIDDEN' }
  | { kind: 'CREATE'; label: string; enabled: true; tooltip?: string }
  | { kind: 'REROLL'; label: string; enabled: boolean; tooltip?: string };

/**
 * Nút Shuffle theo trạng thái lịch (spec §9): chưa có lịch → "Tạo lịch tuần này" (ai cũng bấm được);
 * đã có lịch + trưởng phòng + còn điều kiện → "Xáo lại (còn N lần)"; không đủ điều kiện thì vô hiệu kèm lý do; thành viên thường thì ẩn.
 */
export function shuffleState(p: {
  schedule: ScheduleMeta | null;
  isAdmin: boolean;
  /** Tuần hiện tại hoặc tuần kế tiếp (backend chỉ sinh lịch cho hai tuần này). */
  inRange: boolean;
  /** Đã có ca được nộp / duyệt. */
  hasActivity: boolean;
}): ShuffleAction {
  const { schedule, isAdmin, inRange, hasActivity } = p;
  if (!inRange) return { kind: 'HIDDEN' };
  if (!schedule || schedule.status === 'EMPTY') return { kind: 'CREATE', label: 'Tạo lịch tuần này', enabled: true };
  if (!isAdmin) return { kind: 'HIDDEN' };

  const left = MAX_REROLLS - schedule.rerollCount;
  if (schedule.status === 'LOCKED') {
    return { kind: 'REROLL', label: 'Xáo lại lịch', enabled: false, tooltip: 'Đã khóa do tuần này đã bắt đầu' };
  }
  if (hasActivity) {
    return { kind: 'REROLL', label: 'Xáo lại lịch', enabled: false, tooltip: 'Đã có ca được nộp hoặc duyệt nên không xáo lại cả lịch được.' };
  }
  if (left <= 0) {
    return { kind: 'REROLL', label: 'Xáo lại lịch', enabled: false, tooltip: `Lịch này đã được xáo lại tối đa ${MAX_REROLLS} lần.` };
  }
  return { kind: 'REROLL', label: `Xáo lại (còn ${left} lần)`, enabled: true };
}
