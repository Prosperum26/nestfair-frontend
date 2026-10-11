import type { Assignment } from './types.ts';
import { weekDays } from './week.ts';

/** Nhóm theo ngày làm (giờ nhà). Luôn đủ 7 khóa "YYYY-MM-DD"; ca có ngày làm ngoài tuần bị bỏ qua. */
export function groupByDay(assignments: Assignment[], weekKey: string): Record<string, Assignment[]> {
  const groups: Record<string, Assignment[]> = Object.fromEntries(weekDays(weekKey).map((d) => [d.key, []]));
  for (const a of assignments) groups[a.occurrenceDate]?.push(a);
  return groups;
}

export interface CalendarRow {
  choreId: string;
  title: string;
  weight: number;
  /** ngày → các ca của việc đó trong ngày (xếp chồng nếu nhiều ca). */
  cells: Record<string, Assignment[]>;
}

/** Mỗi việc một hàng, sắp theo ngày làm đầu tiên rồi theo tên. */
export function buildCalendarRows(assignments: Assignment[], weekKey: string): CalendarRow[] {
  const empty = () => Object.fromEntries(weekDays(weekKey).map((d) => [d.key, [] as Assignment[]]));
  const rows = new Map<string, CalendarRow & { first: string }>();
  for (const a of assignments) {
    const row = rows.get(a.choreId) ?? { choreId: a.choreId, title: a.choreTitle, weight: a.weight, cells: empty(), first: a.occurrenceDate };
    row.cells[a.occurrenceDate]?.push(a);
    if (a.occurrenceDate < row.first) row.first = a.occurrenceDate;
    rows.set(a.choreId, row);
  }
  return [...rows.values()]
    .sort((x, y) => x.first.localeCompare(y.first) || x.title.localeCompare(y.title, 'vi'))
    .map((r) => ({ choreId: r.choreId, title: r.title, weight: r.weight, cells: r.cells }));
}

export type KanbanColumn = 'TODO' | 'PENDING_VERIFY' | 'REJECTED' | 'DONE' | 'MISSED';

export interface KanbanGroups {
  columns: Record<KanbanColumn, Assignment[]>;
  /** Ca chưa có người nhận (UNASSIGNED): hộp riêng, trưởng phòng giao tay. */
  unassigned: Assignment[];
  /** Ca đã hủy (nghỉ nhà, tắt việc…): hộp riêng. */
  cancelled: Assignment[];
}

/** 5 cột Kanban theo trạng thái; `UNASSIGNED` và `CANCELLED` ở hộp lọc riêng. */
export function groupByColumn(assignments: Assignment[]): KanbanGroups {
  const out: KanbanGroups = {
    columns: { TODO: [], PENDING_VERIFY: [], REJECTED: [], DONE: [], MISSED: [] },
    unassigned: [],
    cancelled: [],
  };
  for (const a of assignments) {
    if (a.status === 'UNASSIGNED') out.unassigned.push(a);
    else if (a.status === 'CANCELLED') out.cancelled.push(a);
    else out.columns[a.status].push(a);
  }
  return out;
}

/** Rút gọn danh sách ca trong một ngày: hiện `max` ca đầu, còn lại gom thành "+N". */
export function collapseDay(list: Assignment[], max = 3, expanded = false): { shown: Assignment[]; hidden: number } {
  if (expanded || list.length <= max) return { shown: list, hidden: 0 };
  return { shown: list.slice(0, max), hidden: list.length - max };
}
