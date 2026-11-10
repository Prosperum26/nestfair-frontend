/** Thời gian giữ hiệu ứng điểm nhấn trước khi luồng chạy tiếp (đóng modal, gỡ dòng khỏi danh sách). */
export const HOLD_MS = { verifyStamp: 700, swapAccepted: 600, settled: 900 } as const;

/** Bật "giảm chuyển động" thì không giữ: hiệu ứng không chạy nên không có gì để chờ. */
export function holdFor(key: keyof typeof HOLD_MS, reducedMotion: boolean | null): number {
  return reducedMotion ? 0 : HOLD_MS[key];
}
