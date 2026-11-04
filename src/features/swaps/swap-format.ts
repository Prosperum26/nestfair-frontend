import { dueLabel } from '@/features/chores/week.ts';
import { houseClock } from '@/lib/house-time.ts';

const HOUR = 3_600_000;
const MINUTE = 60_000;

/** "còn 46 giờ" (làm tròn lên), dưới 1 giờ thì "còn 35 phút", quá hạn thì "Đã hết hạn". */
export function timeLeftLabel(expiresAt: string | Date, now: Date = new Date()): string {
  const diff = new Date(expiresAt).getTime() - now.getTime();
  if (diff <= 0) return 'Đã hết hạn';
  if (diff < HOUR) return `còn ${Math.ceil(diff / MINUTE)} phút`;
  return `còn ${Math.ceil(diff / HOUR)} giờ`;
}

/** "Mai có 24 giờ để trả lời (hết hạn 07.10 22:00)." theo giờ nhà. */
export function expiryNote(name: string, expiresAt: string | Date, now: Date = new Date()): string {
  const diff = new Date(expiresAt).getTime() - now.getTime();
  const span = diff < HOUR ? `${Math.max(1, Math.ceil(diff / MINUTE))} phút` : `${Math.ceil(diff / HOUR)} giờ`;
  const clock = houseClock(expiresAt);
  return `${name} có ${span} để trả lời (hết hạn ${clock.ddmm} ${clock.hm}).`;
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
