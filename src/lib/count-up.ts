/**
 * Giá trị hiển thị tại tiến độ `t` (0 → 1) khi đếm từ `from` tới `to`: easing chậm dần cuối (cubic out),
 * luôn là số nguyên VNĐ, đơn điệu, kết thúc đúng `to`.
 */
export function countUpFrame(from: number, to: number, t: number): number {
  const p = Math.min(1, Math.max(0, t));
  if (p === 1) return to;
  const eased = 1 - (1 - p) ** 3;
  return Math.round(from + (to - from) * eased);
}
