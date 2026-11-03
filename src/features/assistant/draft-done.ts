import { useSyncExternalStore } from 'react';

/**
 * Nút DRAFT_EXPENSE không có khóa chống trùng ở server (khoản chi do người dùng bấm Lưu trong form),
 * nên "đã ghi" chỉ là tiện ích theo trình duyệt: nhớ qua reload bằng localStorage, hỏng thì chỉ mất trạng thái.
 */
const STORAGE_KEY = 'nestfair.assistant.expense-done';
const MAX_KEPT = 200;

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
  } catch {
    return [];
  }
}

let snapshot: readonly string[] = load();
const listeners = new Set<() => void>();

export const draftKey = (messageId: string, actionIndex: number) => `${messageId}:${actionIndex}`;

/** Đánh dấu nút khoản chi đã được lưu. Gọi lại với cùng khóa không làm gì. */
export function markDraftDone(key: string): void {
  if (snapshot.includes(key)) return;
  snapshot = [...snapshot, key].slice(-MAX_KEPT);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage bị chặn: giữ trạng thái trong phiên.
  }
  listeners.forEach((l) => l());
}

/** Danh sách khóa đã lưu; đổi tham chiếu mỗi khi có khóa mới để React render lại. */
export function useDraftDoneKeys(): readonly string[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
  );
}
