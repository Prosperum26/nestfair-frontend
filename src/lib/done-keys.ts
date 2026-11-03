import { useSyncExternalStore } from 'react';

const MAX_KEPT = 200;

/**
 * Tập khóa "đã xong" theo trình duyệt cho những nút không có khóa chống trùng ở server.
 * Nhớ qua reload bằng localStorage; bị chặn hoặc hỏng thì chỉ mất trạng thái, không lỗi.
 */
export function createDoneKeys(storageKey: string) {
  const load = (): string[] => {
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === 'string') : [];
    } catch {
      return [];
    }
  };

  let current: readonly string[] = load();
  const listeners = new Set<() => void>();
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  };
  const snapshot = () => current;

  return {
    snapshot,
    subscribe,
    /** Đánh dấu một khóa đã xong. Gọi lại với cùng khóa không làm gì. */
    mark(key: string): void {
      if (current.includes(key)) return;
      current = [...current, key].slice(-MAX_KEPT);
      try {
        localStorage.setItem(storageKey, JSON.stringify(current));
      } catch {
        // localStorage bị chặn: giữ trạng thái trong phiên.
      }
      listeners.forEach((l) => l());
    },
    /** Danh sách khóa đã xong; đổi tham chiếu mỗi khi có khóa mới để React render lại. */
    useKeys: (): readonly string[] => useSyncExternalStore(subscribe, snapshot),
  };
}
