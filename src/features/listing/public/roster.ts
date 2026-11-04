import type { PublicRoster } from '../types.ts';

export interface RosterStats {
  members: number;
  minShifts: number;
  maxShifts: number;
}

/** Số ca của từng nhãn ẩn danh trong tuần (một ô có nhiều nhãn thì mỗi nhãn một ca). `members` là số nhãn khác nhau. */
export function rosterStats(roster: PublicRoster): RosterStats {
  const counts = new Map<string, number>();
  for (const row of roster.rows) {
    for (const cell of row.cells) {
      for (const label of cell) counts.set(label, (counts.get(label) ?? 0) + 1);
    }
  }
  const shifts = [...counts.values()];
  return {
    members: counts.size,
    minShifts: shifts.length ? Math.min(...shifts) : 0,
    maxShifts: shifts.length ? Math.max(...shifts) : 0,
  };
}

/** Câu chú thích dưới bảng: "khoảng 3–4 ca/tuần", cùng số ca thì "khoảng 3 ca/tuần". */
export function rosterNote({ members, minShifts, maxShifts }: RosterStats): string {
  const hidden = 'Tên thành viên được ẩn.';
  if (members === 0) return hidden;
  const range = minShifts === maxShifts ? `${minShifts}` : `${minShifts}–${maxShifts}`;
  return `${hidden} Mỗi người trực khoảng ${range} ca/tuần.`;
}
