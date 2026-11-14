import { dueLabel } from '@/features/chores/week.ts';

const HOUR = 3_600_000;
const MINUTE = 60_000;

/** "còn 46 giờ" (làm tròn lên), dưới 1 giờ thì "còn 35 phút", quá hạn thì "Đã hết hạn". */
export function timeLeftLabel(expiresAt: string | Date, now: Date = new Date()): string {
  const diff = new Date(expiresAt).getTime() - now.getTime();
  if (diff <= 0) return 'Đã hết hạn';
  if (diff < HOUR) return `còn ${Math.ceil(diff / MINUTE)} phút`;
  return `còn ${Math.ceil(diff / HOUR)} giờ`;
}

/** "Rửa chén buổi tối · T4 21.10". */
export function slotLabel(slot: { choreTitle: string; occurrenceDate: string }): string {
  return `${slot.choreTitle} · ${dueLabel(slot.occurrenceDate)}`;
}

/** Chênh độ nặng có dấu: +1, −2 (U+2212, không dùng gạch nối), 0. */
export function weightDiffLabel(diff: number): string {
  if (diff > 0) return `+${diff}`;
  if (diff < 0) return `−${Math.abs(diff)}`;
  return '0';
}

/** "3 điểm" (độ nặng). */
export function pointsLabel(weight: number): string {
  return `${weight} điểm`;
}
