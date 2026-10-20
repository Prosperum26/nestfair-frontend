/**
 * Giờ hiển thị theo giờ của nhà (Asia/Ho_Chi_Minh, khớp cron và backend), không theo múi giờ máy người xem:
 * ai mở app ở đâu cũng thấy cùng "21:00" cho cùng một hạn chót.
 */
export const HOUSE_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const PARTS = new Intl.DateTimeFormat('en-GB', {
  timeZone: HOUSE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export interface HouseClock {
  /** "2026-10-21", để so cùng ngày. */
  dayKey: string;
  /** "21.10" (Design.md mục 6). */
  ddmm: string;
  /** "21:00", giờ 24h. */
  hm: string;
}

export function houseClock(date: string | Date): HouseClock {
  const p: Partial<Record<Intl.DateTimeFormatPartTypes, string>> = {};
  for (const part of PARTS.formatToParts(new Date(date))) p[part.type] = part.value;
  return { dayKey: `${p.year}-${p.month}-${p.day}`, ddmm: `${p.day}.${p.month}`, hm: `${p.hour}:${p.minute}` };
}

/** Số ngày lịch (theo giờ nhà) từ `from` tới `to`: 0 cùng ngày, 1 ngày mai, −1 hôm qua. */
export function houseDayDiff(to: string | Date, from: string | Date): number {
  const day = (d: string | Date) => Date.parse(`${houseClock(d).dayKey}T00:00:00Z`);
  return Math.round((day(to) - day(from)) / 86_400_000);
}
