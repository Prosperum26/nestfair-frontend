/** Số món hiện khi thu gọn ở chi tiết khoản chi. */
export const ITEMS_COLLAPSED_COUNT = 6;

/**
 * Tổng các món và phần chênh so với tổng hóa đơn: âm = giảm giá, dương = phí.
 * Số nguyên VNĐ nên phép trừ luôn chính xác.
 */
export function itemsSummary(totalAmount: number, items: readonly { lineTotal: number }[]): { itemsTotal: number; adjustment: number } {
  const itemsTotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { itemsTotal, adjustment: totalAmount - itemsTotal };
}

/** Các món đang hiển thị: thu gọn thì chỉ ITEMS_COLLAPSED_COUNT món đầu. */
export function visibleItems<T>(items: readonly T[], expanded: boolean): T[] {
  return expanded ? [...items] : items.slice(0, ITEMS_COLLAPSED_COUNT);
}
