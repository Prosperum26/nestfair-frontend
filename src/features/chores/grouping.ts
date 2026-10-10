import type { Assignment } from './types.ts';
import { dayKeyOf, weekDays } from './week.ts';

/** Nhóm theo ngày hạn (giờ VN). Luôn đủ 7 khóa "YYYY-MM-DD"; ca có hạn ngoài tuần bị bỏ qua. */
export function groupByDay(assignments: Assignment[], weekKey: string): Record<string, Assignment[]> {
  const groups: Record<string, Assignment[]> = Object.fromEntries(weekDays(weekKey).map((d) => [d.key, []]));
  for (const a of assignments) groups[dayKeyOf(a.dueAt)]?.push(a);
  return groups;
}

export type KanbanColumn = 'TODO' | 'PENDING_VERIFY' | 'DONE' | 'ISSUE';

/** Cột Kanban; ISSUE ("Cần xử lý") gom ca bị từ chối và ca quá hạn. */
export function groupByStatus(assignments: Assignment[]): Record<KanbanColumn, Assignment[]> {
  const groups: Record<KanbanColumn, Assignment[]> = { TODO: [], PENDING_VERIFY: [], DONE: [], ISSUE: [] };
  for (const a of assignments) {
    const column: KanbanColumn = a.status === 'REJECTED' || a.status === 'MISSED' ? 'ISSUE' : a.status;
    groups[column].push(a);
  }
  return groups;
}
