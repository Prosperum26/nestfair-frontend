/** Khóa tháng `YYYY-MM` (giờ máy, người dùng ở VN nên trùng giờ nhà). */
const pad = (n: number) => n.toString().padStart(2, '0');

export function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

/** Giá trị ?month= trên URL: hợp lệ (YYYY-MM, không quá tháng \`max\`) thì trả về, ngược lại null. */
export function parseMonthParam(value: string | null, max: string): string | null {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  return value <= max ? value : null;
}

function parse(key: string): { year: number; month: number } {
  const [year, month] = key.split('-').map(Number);
  return { year, month };
}

/** Lùi / tiến `delta` tháng: shiftMonth('2026-01', -1) = '2025-12'. */
export function shiftMonth(key: string, delta: number): string {
  const { year, month } = parse(key);
  return monthKeyOf(new Date(year, month - 1 + delta, 1));
}

/** "Tháng 10.2026" cho bộ chuyển tháng. */
export function monthLabel(key: string): string {
  const { year, month } = parse(key);
  return `Tháng ${month}.${year}`;
}

/** "THÁNG 10.2026" cho overline. */
export function monthOverlineOf(key: string): string {
  return monthLabel(key).toUpperCase();
}

/** Số tháng (1–12). */
export function monthNumber(key: string): number {
  return parse(key).month;
}
