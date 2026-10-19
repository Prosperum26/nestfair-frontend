/** Khớp DTO backend module expenses (Issue #9). Tiền luôn là số nguyên VNĐ. */
export type ExpenseCategory = 'FOOD' | 'RENT' | 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'SUPPLIES' | 'GIFT' | 'OTHER';

/** EQUAL = chia đều cả nhà, CUSTOM = chọn người rồi chia đều, EXACT = số tiền từng người. ITEMIZED chưa hỗ trợ. */
export type SplitType = 'EQUAL' | 'CUSTOM' | 'EXACT' | 'ITEMIZED';

export interface UserBrief {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface ExpenseShare {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  totalAmount: number;
  splitType: SplitType;
  spentAt: string;
  note: string | null;
  receiptImageUrl: string | null;
  payer: UserBrief;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  splits: ExpenseShare[];
  /** Phần của người đang xem (0 nếu không chịu phần nào). */
  myShare: number;
  /** Người trả, người ghi hoặc trưởng phòng. */
  canEdit: boolean;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
  count: number;
}

export interface ExpenseSummary {
  month: string;
  totalAmount: number;
  expenseCount: number;
  participantCount: number;
  paidByMe: number;
  paidByMeCount: number;
  myShare: number;
  /** paidByMe − myShare của riêng tháng này. */
  diff: number;
  byCategory: CategoryTotal[];
}

export interface ExpenseInput {
  title: string;
  category: ExpenseCategory;
  totalAmount: number;
  splitType: SplitType;
  payerId?: string;
  participantIds?: string[];
  splits?: { userId: string; amount: number }[];
  spentAt?: string;
  note?: string | null;
  receiptImageUrl?: string | null;
}

export interface ExpenseFilters {
  /** YYYY-MM */
  month: string;
  payerId?: string;
  category?: ExpenseCategory;
  q?: string;
}
