import { firstName } from '@/lib/date.ts';
import type { NotificationDto, NotificationList } from './types.ts';

/** Sự kiện socket đã có (AGENTS.md mục 5) báo hiệu có thể có thông báo mới: chuông chỉ cần tải lại qua REST. */
export const NOTIFICATION_EVENTS = {
  house: ['expense:new', 'settlement:requested'],
  user: ['reminder:due'],
} as const;

export interface NotificationView {
  kind: 'expense' | 'debt' | 'reminder';
  title: string;
  detail: string;
  /** Số nguyên VNĐ hiện bằng font mono; null khi thông báo không có tiền. */
  amount: number | null;
  /** Trang mở ra khi bấm vào thông báo. */
  to: string;
}

const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const money = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);

/**
 * Ghép câu hiển thị từ `type` + `params`. Loại chưa biết hoặc thiếu dữ liệu thì trả null để danh sách bỏ qua
 * dòng đó thay vì vỡ (backend có thể thêm loại mới trước khi client cập nhật).
 */
export function notificationView(n: NotificationDto): NotificationView | null {
  const p: Record<string, unknown> = n.params && typeof n.params === 'object' ? n.params : {};
  if (n.type === 'EXPENSE_CREATED') {
    if (!text(p.title) || !text(p.payerName) || !money(p.share)) return null;
    return { kind: 'expense', title: `${firstName(p.payerName)} trả “${p.title}”`, detail: 'Phần của bạn', amount: p.share, to: '/expenses' };
  }
  if (n.type === 'DEBT_PAID') {
    if (!text(p.fromName) || !money(p.amount)) return null;
    return { kind: 'debt', title: `${firstName(p.fromName)} báo đã chuyển tiền cho bạn`, detail: 'Chờ bạn xác nhận', amount: p.amount, to: '/payments' };
  }
  if (n.type === 'REMINDER_DUE') {
    if (!text(p.title)) return null;
    return { kind: 'reminder', title: p.title, detail: 'Nhắc nhở', amount: null, to: '/assistant' };
  }
  return null;
}

/**
 * Danh sách sau khi đánh dấu đã đọc một thông báo (`id`) hoặc tất cả (`'all'`), để chuông đổi ngay khi bấm.
 * Không sửa danh sách gốc; dòng đã đọc giữ nguyên thời điểm đọc cũ.
 */
export function applyRead(list: NotificationList, target: string | 'all', nowIso: string): NotificationList {
  if (target === 'all') {
    return { items: list.items.map((n) => (n.readAt ? n : { ...n, readAt: nowIso })), unreadCount: 0 };
  }
  const hit = list.items.find((n) => n.id === target);
  if (!hit || hit.readAt) return list;
  return {
    items: list.items.map((n) => (n.id === target ? { ...n, readAt: nowIso } : n)),
    unreadCount: Math.max(0, list.unreadCount - 1),
  };
}
