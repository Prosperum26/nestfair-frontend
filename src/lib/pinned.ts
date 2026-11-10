export interface Pin<T> {
  item: T;
  /** Vị trí của dòng trong danh sách lúc bắt đầu ghim. */
  index: number;
}

/**
 * Giữ các dòng đang ghim (vd. giao dịch vừa xác nhận, đang chạy hiệu ứng) dù dữ liệu mới không còn chúng,
 * đặt lại đúng vị trí cũ. Dòng ghim vẫn còn trong dữ liệu thì dùng bản mới, không nhân đôi.
 */
export function withPinned<T>(list: T[], pinned: ReadonlyMap<string, Pin<T>>, keyOf: (item: T) => string): T[] {
  if (pinned.size === 0) return list;
  const present = new Set(list.map(keyOf));
  const missing = [...pinned.entries()].filter(([key]) => !present.has(key)).sort((x, y) => x[1].index - y[1].index);
  if (missing.length === 0) return list;
  const next = [...list];
  for (const [, pin] of missing) next.splice(Math.min(pin.index, next.length), 0, pin.item);
  return next;
}
