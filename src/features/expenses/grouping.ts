import type { Expense } from './types.ts';

const WEEKDAYS = ['CHỦ NHẬT', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'];
const pad = (n: number) => n.toString().padStart(2, '0');

/** "05.10" theo giờ máy. */
export function dayMonth(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
}

/** YYYY-MM-DD theo giờ máy (giá trị cho ô ngày khi sửa). */
export function localDateOf(iso: string | Date): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Gom khoản chi theo ngày cho danh sách mobile (ảnh 07 mobile): nhãn "05.10 · THỨ HAI".
 * Giữ thứ tự đầu vào (backend đã sắp mới nhất trước).
 */
export function groupByDay(expenses: Expense[]): { key: string; label: string; items: Expense[] }[] {
  const groups: { key: string; label: string; items: Expense[] }[] = [];
  for (const e of expenses) {
    const key = localDateOf(e.spentAt);
    let group = groups.find((g) => g.key === key);
    if (!group) {
      group = { key, label: `${dayMonth(e.spentAt)} · ${WEEKDAYS[new Date(e.spentAt).getDay()]}`, items: [] };
      groups.push(group);
    }
    group.items.push(e);
  }
  return groups;
}
