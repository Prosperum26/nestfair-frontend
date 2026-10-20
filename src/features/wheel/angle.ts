/**
 * Góc bánh xe là **hàm thuần của giờ server** (đặc tả #5 mục 15): mọi máy tính cùng một góc tại cùng một
 * thời điểm, nên tab ẩn rồi hiện, máy rớt khung hay người vào muộn đều đúng góc. Không cộng dồn theo khung hình.
 *
 * Quy ước: lát `i` chiếm [i·w, (i+1)·w) độ theo chiều kim đồng hồ tính từ đỉnh; bánh xe xoay theo chiều kim
 * đồng hồ một góc R; kim cố định ở đỉnh.
 */

/** Số vòng quay đủ trước khi dừng. */
export const TURNS = 5;
/** Lệch trong lát tối đa ±35% bề rộng lát (không bao giờ dừng sát biên). */
const JITTER = 0.7;

export function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

/** Số thực [0, 1) suy ra từ seed (giống nhau ở mọi máy). */
function seedFraction(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), 1 | t);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Tổng góc phải quay (độ) để kim dừng ở lát `landingIndex`, lệch nhỏ trong lát theo `seed`. */
export function totalRotation(sliceCount: number, landingIndex: number, seed: number): number {
  const w = 360 / sliceCount;
  const target = (landingIndex + 0.5) * w + (seedFraction(seed) - 0.5) * JITTER * w;
  return TURNS * 360 + ((((360 - target) % 360) + 360) % 360);
}

/** Tiến độ [0, 1] tại giờ server `nowMs`. */
export function spinProgress(nowMs: number, startAtMs: number, durationMs: number): number {
  return Math.min(1, Math.max(0, (nowMs - startAtMs) / durationMs));
}

/** Góc (độ) tại giờ server `nowMs`. */
export function wheelAngle(nowMs: number, startAtMs: number, durationMs: number, total: number): number {
  const p = spinProgress(nowMs, startAtMs, durationMs);
  return p >= 1 ? total : easeOutCubic(p) * total;
}

/** Lát đang nằm dưới kim khi bánh xe đã xoay `angle` độ. */
export function sliceAtPointer(angle: number, sliceCount: number): number {
  const w = 360 / sliceCount;
  const atPointer = (((-angle) % 360) + 360) % 360;
  return Math.floor(atPointer / w) % sliceCount;
}
