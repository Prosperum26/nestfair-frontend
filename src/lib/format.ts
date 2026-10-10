/** 2280000 -> "2.280.000đ" (Design.md mục 6). Tiền luôn là số nguyên VNĐ. */
export function formatVnd(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  const digits = Math.abs(Math.trunc(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${sign}${digits}đ`;
}
