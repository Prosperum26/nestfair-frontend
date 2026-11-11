/** Số liệu minh họa trên landing, khớp bộ dữ liệu Nhà 12A (Design.md mục 7): 4 người H, T, M, Q. */
export type PersonKey = 'H' | 'T' | 'M' | 'Q';

export interface Transfer {
  from: PersonKey;
  to: PersonKey;
  amount: number;
}

export const PEOPLE: Record<PersonKey, { name: string }> = {
  H: { name: 'Hùng' },
  T: { name: 'Thiện' },
  M: { name: 'Mai' },
  Q: { name: 'Quân' },
};

/** 6 khoản nợ chéo trước khi rút gọn (người nợ → chủ nợ). */
export const BEFORE_DEBTS: Transfer[] = [
  { from: 'H', to: 'M', amount: 145_000 },
  { from: 'Q', to: 'M', amount: 40_000 },
  { from: 'H', to: 'Q', amount: 75_000 },
  { from: 'T', to: 'M', amount: 195_000 },
  { from: 'T', to: 'H', amount: 50_000 },
  { from: 'T', to: 'Q', amount: 135_000 },
];

/** Sau Min Cash Flow chỉ còn 2 giao dịch. */
export const AFTER_TRANSFERS: Transfer[] = [
  { from: 'T', to: 'M', amount: 380_000 },
  { from: 'H', to: 'Q', amount: 170_000 },
];

export const total = (transfers: readonly Transfer[]): number => transfers.reduce((sum, t) => sum + t.amount, 0);

/** "145k" cho nhãn trên sơ đồ. */
export const shortAmount = (amount: number): string => `${Math.round(amount / 1000)}k`;
