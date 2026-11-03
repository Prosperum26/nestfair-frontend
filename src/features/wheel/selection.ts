import { firstName } from '@/lib/date.ts';
import { houseClock, houseDayDiff } from '@/lib/house-time.ts';

/** Giống server: bỏ ký tự điều khiển, gộp khoảng trắng thừa. */
export function normalizeTitle(value: string): string {
  return value.replace(/\p{Cc}/gu, ' ').replace(/\s+/g, ' ').trim();
}

export const TITLE_MIN = 3;
export const TITLE_MAX = 60;

export function titleError(raw: string): string | null {
  const t = normalizeTitle(raw);
  if (!t) return 'Nhập tên việc đột xuất.';
  if (t.length < TITLE_MIN || t.length > TITLE_MAX) return `Tên việc cần từ ${TITLE_MIN} đến ${TITLE_MAX} ký tự.`;
  return null;
}

/** Bật / tắt một người trên vòng; người vắng hôm nay không chọn được. Giữ thứ tự theo danh sách thành viên. */
export function toggleParticipant(selected: readonly string[], id: string, members: readonly { id: string; absentToday: boolean }[]): string[] {
  const member = members.find((m) => m.id === id);
  if (!member || member.absentToday) return [...selected];
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return members.map((m) => m.id).filter((x) => next.has(x));
}

/** Nút Quay chỉ bật khi có ≥ 2 người, tên việc hợp lệ và đã chọn hạn hợp lệ. */
export function canSpin(selected: readonly string[], title: string, dueValid: boolean): boolean {
  return selected.length >= 2 && titleError(title) === null && dueValid;
}

/** Hạn của ca vòng quay theo giờ nhà: "21:00 hôm nay" · "21:00 ngày mai" · "23.10 21:00". */
export function formatDue(iso: string, now: Date = new Date()): string {
  const { ddmm, hm } = houseClock(iso);
  const diff = houseDayDiff(iso, now);
  if (diff === 0) return `${hm} hôm nay`;
  if (diff === 1) return `${hm} ngày mai`;
  return `${ddmm} ${hm}`;
}

/** Câu kết quả trong modal: người xem trúng thì "Bạn", người khác thì tên gọi. */
export function resultHeadline(winner: { id: string; name: string }, meUserId?: string | null): string {
  return `${winner.id === meUserId ? 'Bạn' : firstName(winner.name)} đã trúng secret!`;
}

/** Câu đọc cho trình đọc màn hình khi bánh xe dừng. */
export function resultAnnouncement(winner: { id: string; name: string }, taskTitle: string, meUserId?: string | null): string {
  return `Kết quả: ${resultHeadline(winner, meUserId)} ${taskTitle}`;
}
