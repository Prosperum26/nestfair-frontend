import { useEffect, useState } from 'react';

/** Nhóm hẹn giờ hủy được cùng lúc. */
export function createTimers() {
  const ids = new Set<ReturnType<typeof setTimeout>>();
  return {
    after(ms: number, fn: () => void) {
      const id = setTimeout(() => {
        ids.delete(id);
        fn();
      }, ms);
      ids.add(id);
    },
    clearAll() {
      for (const id of ids) clearTimeout(id);
      ids.clear();
    },
  };
}

/**
 * Hẹn giờ gắn với vòng đời component: unmount thì hủy hết. Dùng cho các nhịp giữ hiệu ứng rồi mới gọi callback
 * của cha (vd. đóng modal), để callback không chạy sau khi người dùng đã đóng và mở thứ khác.
 */
export function useTimers() {
  const [timers] = useState(createTimers);
  useEffect(() => timers.clearAll, [timers]);
  return timers;
}
