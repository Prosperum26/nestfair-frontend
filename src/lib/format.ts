const groupThousands = (n: number) =>
  Math.abs(Math.trunc(n))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** 2280000 -> "2.280.000đ" (Design.md mục 6). Tiền luôn là số nguyên VNĐ. */
export function formatVnd(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}${groupThousands(amount)}đ`;
}

/** Số dư luôn có dấu: "+380.000đ" (được nhận), "−170.000đ" (cần trả, U+2212). */
export function formatSignedVnd(amount: number): string {
  return amount > 0 ? `+${formatVnd(amount)}` : formatVnd(amount);
}

/** Nhãn gọn cho sơ đồ: 170000 -> "170k". Không chẵn nghìn thì hiện đủ để không làm tròn mất tiền. */
export function formatShortVnd(amount: number): string {
  if (amount !== 0 && amount % 1000 === 0) return `${amount < 0 ? '−' : ''}${groupThousands(amount / 1000)}k`;
  return formatVnd(amount);
}

/** Giá trị hiển thị trong ô nhập tiền: 450000 -> "450.000". */
export function formatVndInput(amount: number | null): string {
  return amount === null ? '' : groupThousands(amount);
}

/** Đọc ô nhập tiền: bỏ mọi ký tự không phải số ("1.234.567đ" -> 1234567). Không có số thì null. */
export function parseVndInput(text: string): number | null {
  const digits = text.replace(/\D/g, '').slice(0, 10);
  return digits ? Number(digits) : null;
}
