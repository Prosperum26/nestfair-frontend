import { canVerify } from './permissions.ts';
import { dayKeyOf } from './week.ts';
import type { Assignment } from './types.ts';
import { weekDays } from './week.ts';

const HOUR = 3_600_000;

/**
 * Ca hiện trên Lịch tuần: bỏ ca vòng quay (source = WHEEL). Việc đột xuất không thuộc lịch xoay vòng; nó chỉ hiện
 * ở "Việc của bạn hôm nay", "Chờ bạn duyệt" và Kanban.
 */
export function onCalendar(assignments: Assignment[]): Assignment[] {
  return assignments.filter((a) => a.source !== 'WHEEL');
}

/** Gộp nhiều danh sách ca (vd. tuần này + tuần trước), bỏ trùng theo id. */
export function mergeAssignments(...lists: (Assignment[] | undefined)[]): Assignment[] {
  const byId = new Map<string, Assignment>();
  for (const list of lists) for (const a of list ?? []) byId.set(a.id, a);
  return [...byId.values()];
}

/** Ca mọi người đã nộp đang chờ mình duyệt (gồm ca vòng quay), sắp theo hạn. */
export function waitingForReview(assignments: Assignment[], meUserId: string | undefined): Assignment[] {
  return mergeAssignments(assignments)
    .filter((a) => canVerify(a, meUserId))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}

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

/**
 * Đưa lên đầu các ca liên quan đến người dùng (ca của mình còn việc phải làm, ca đang chờ mình duyệt) để khi
 * rút gọn "+N" chúng không bị giấu. Ổn định (giữ thứ tự cũ trong từng nhóm), không đổi mảng gốc.
 */
export function prioritizeForMe(list: Assignment[], meUserId: string | undefined): Assignment[] {
  if (!meUserId) return list;
  const rank = (a: Assignment) => {
    const mine = a.assigneeUserId === meUserId;
    const actionable = mine ? a.status === 'TODO' || a.status === 'REJECTED' || a.status === 'PENDING_VERIFY' : a.status === 'PENDING_VERIFY';
    return actionable ? 0 : 1;
  };
  return list
    .map((a, i) => ({ a, i, r: rank(a) }))
    .sort((x, y) => x.r - y.r || x.i - y.i)
    .map((x) => x.a);
}

/**
 * Các ca của người dùng trong ngày `today` (giờ VN), sắp theo hạn. Ca đã hủy / chưa giao không tính.
 * Ca vòng quay có thể hạn tới ngày mai (quay tối nay, hạn "ngày mai 21:00"): ca đó vẫn hiện những ngày sau
 * khi còn việc phải làm (Chờ làm / Làm lại / Chờ duyệt) và chưa quá hạn + ân hạn.
 */
export function myShiftsToday(assignments: Assignment[], meUserId: string | undefined, today: Date, graceHours = 3): Assignment[] {
  if (!meUserId) return [];
  const key = dayKeyOf(today);
  const openWheel = (a: Assignment) =>
    a.source === 'WHEEL' &&
    (a.status === 'PENDING_VERIFY' ||
      ((a.status === 'TODO' || a.status === 'REJECTED') && today.getTime() <= new Date(a.dueAt).getTime() + graceHours * HOUR));
  return mergeAssignments(assignments)
    .filter((a) => a.assigneeUserId === meUserId && a.status !== 'CANCELLED' && (dayKeyOf(a.occurrenceDate) === key || openWheel(a)))
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());
}
