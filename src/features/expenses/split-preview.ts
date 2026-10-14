import type { ExpenseCategory, ExpenseInput } from './types.ts';

/** Kiểu chia người dùng chọn được trên form (ITEMIZED chờ issue OCR). */
export type FormSplitType = 'EQUAL' | 'CUSTOM' | 'EXACT';

export interface SplitPreviewInput {
  splitType: FormSplitType;
  total: number | null;
  /** Thành viên theo thứ tự vào nhà: quyết định ai nhận 1đ dư (giống backend). */
  memberIds: readonly string[];
  /** Người được tích (CUSTOM, EXACT). */
  participants: readonly string[];
  /** Số tiền từng người (EXACT); ô trống = null. */
  exact: Readonly<Record<string, number | null | undefined>>;
}

export interface SplitPreview {
  shares: { userId: string; amount: number }[];
  assigned: number;
  /** total − assigned: dương = còn thiếu, âm = thừa. */
  diff: number;
  ok: boolean;
}

function splitEqual(total: number, userIds: readonly string[]) {
  const base = Math.floor(total / userIds.length);
  const remainder = total - base * userIds.length;
  return userIds.map((userId, i) => ({ userId, amount: base + (i < remainder ? 1 : 0) }));
}

/**
 * Phần chia xem trước trên form, cùng thuật toán với backend (expenses/algorithms/split.ts):
 * chia đều theo số nguyên, phần dư cộng lần lượt 1đ từ người đứng đầu danh sách thành viên.
 */
export function previewSplit({ splitType, total, memberIds, participants, exact }: SplitPreviewInput): SplitPreview {
  const amount = total ?? 0;
  const chosen = memberIds.filter((id) => participants.includes(id));
  let shares: SplitPreview['shares'];
  if (splitType === 'EXACT') {
    shares = chosen.map((userId) => ({ userId, amount: exact[userId] ?? 0 }));
  } else {
    const users = splitType === 'EQUAL' ? memberIds : chosen;
    shares = users.length === 0 ? [] : amount > 0 ? splitEqual(amount, users) : users.map((userId) => ({ userId, amount: 0 }));
  }
  const assigned = shares.reduce((s, x) => s + x.amount, 0);
  const diff = amount - assigned;
  return { shares, assigned, diff, ok: amount > 0 && shares.length > 0 && diff === 0 };
}

export interface ExpenseFormValues {
  title: string;
  /** YYYY-MM-DD */
  date: string;
  totalAmount: number | null;
  payerId: string;
  category: ExpenseCategory;
  splitType: FormSplitType;
  participants: string[];
  exact: Record<string, number | null>;
  note: string;
  receiptImageUrl: string | null;
}

/** Ngày chọn trên form → 12:00 giờ VN (tránh lệch ngày khi hiển thị ở múi giờ khác). */
export const spentAtOf = (date: string) => `${date}T12:00:00+07:00`;

/** Giá trị form (đã qua schema) → body API. Chỉ gửi trường của đúng kiểu chia. */
export function toExpenseInput(v: Omit<ExpenseFormValues, 'totalAmount'> & { totalAmount: number }): ExpenseInput {
  return {
    title: v.title.trim(),
    category: v.category,
    totalAmount: v.totalAmount,
    payerId: v.payerId,
    splitType: v.splitType,
    ...(v.splitType === 'CUSTOM' ? { participantIds: v.participants } : {}),
    ...(v.splitType === 'EXACT' ? { splits: v.participants.map((userId) => ({ userId, amount: v.exact[userId] ?? 0 })) } : {}),
    spentAt: spentAtOf(v.date),
    note: v.note.trim() || null,
    receiptImageUrl: v.receiptImageUrl,
  };
}
