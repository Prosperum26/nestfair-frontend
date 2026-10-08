import type { HouseSummary } from './types.ts';

/**
 * Nhà đang xem: nhà đã chọn lần trước nếu user vẫn còn ở đó,
 * nếu không thì nhà vào gần nhất (backend trả theo joinedAt giảm dần).
 */
export function pickCurrentHouse(
  houses: HouseSummary[],
  storedId: string | null,
): HouseSummary | null {
  return houses.find((h) => h.id === storedId) ?? houses[0] ?? null;
}
