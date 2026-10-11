/**
 * Tuần ISO (Thứ Hai → Chủ Nhật) theo giờ Việt Nam (UTC+7), khớp backend `week.ts`.
 * Tính bằng số học UTC để kết quả không phụ thuộc múi giờ của trình duyệt.
 */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] as const;

const pad = (n: number) => n.toString().padStart(2, '0');

/** Thứ Hai 00:00 giờ VN của tuần 1 ISO (ms epoch thật). */
function weekOneStart(year: number): number {
  const jan4 = Date.UTC(year, 0, 4);
  const dow = (new Date(jan4).getUTCDay() + 6) % 7;
  return jan4 - dow * DAY_MS - VN_OFFSET_MS;
}

export function weekKeyOf(date: Date): string {
  const vn = new Date(date.getTime() + VN_OFFSET_MS);
  const dow = (vn.getUTCDay() + 6) % 7;
  const thursday = new Date(Date.UTC(vn.getUTCFullYear(), vn.getUTCMonth(), vn.getUTCDate() - dow + 3));
  const year = thursday.getUTCFullYear();
  const weekNo = Math.floor((thursday.getTime() - (weekOneStart(year) + VN_OFFSET_MS)) / WEEK_MS) + 1;
  return `${year}-W${pad(weekNo)}`;
}

function weekStart(weekKey: string): number {
  const [year, week] = weekKey.split('-W').map(Number);
  return weekOneStart(year) + (week - 1) * WEEK_MS;
}

export function shiftWeek(weekKey: string, delta: number): string {
  return weekKeyOf(new Date(weekStart(weekKey) + delta * WEEK_MS + DAY_MS));
}

export interface WeekDay {
  /** "2026-10-05" (ngày theo giờ VN). */
  key: string;
  label: (typeof LABELS)[number];
  day: string;
  month: string;
}

/** Ngày theo giờ VN dạng "YYYY-MM-DD" của một thời điểm. */
export function dayKeyOf(date: string | Date): string {
  const vn = new Date(new Date(date).getTime() + VN_OFFSET_MS);
  return `${vn.getUTCFullYear()}-${pad(vn.getUTCMonth() + 1)}-${pad(vn.getUTCDate())}`;
}

export function weekDays(weekKey: string): WeekDay[] {
  const start = weekStart(weekKey);
  return LABELS.map((label, i) => {
    const key = dayKeyOf(new Date(start + i * DAY_MS));
    return { key, label, day: key.slice(8), month: key.slice(5, 7) };
  });
}

/** "CN 11.10": thứ + ngày.tháng theo giờ VN của một hạn chót. */
export function dueLabel(date: string | Date): string {
  const key = dayKeyOf(date);
  const label = LABELS[(new Date(`${key}T00:00:00Z`).getUTCDay() + 6) % 7];
  return `${label} ${key.slice(8)}.${key.slice(5, 7)}`;
}

/** "TUẦN 41 · 05-11.10.2026"; tuần giữa hai tháng: "TUẦN 44 · 26.10-01.11.2026". */
export function weekRangeLabel(weekKey: string): string {
  const days = weekDays(weekKey);
  const first = days[0];
  const last = days[6];
  const year = last.key.slice(0, 4);
  const range =
    first.month === last.month
      ? `${first.day}-${last.day}.${last.month}.${year}`
      : `${first.day}.${first.month}-${last.day}.${last.month}.${year}`;
  return `TUẦN ${weekKey.slice(-2)} · ${range}`;
}

/** "21:00": giờ hạn theo giờ VN của một thời điểm. */
export function dueTimeLabel(date: string | Date): string {
  const vn = new Date(new Date(date).getTime() + VN_OFFSET_MS);
  return `${pad(vn.getUTCHours())}:${pad(vn.getUTCMinutes())}`;
}

/** Thứ Hai của tuần ISO `weekKey` dạng "YYYY-MM-DD". */
export function weekStartOfKey(weekKey: string): string {
  return dayKeyOf(new Date(weekStart(weekKey)));
}

/** "2026-10-12" → "12.10". */
export function shortDate(ds: string): string {
  return `${ds.slice(8, 10)}.${ds.slice(5, 7)}`;
}
