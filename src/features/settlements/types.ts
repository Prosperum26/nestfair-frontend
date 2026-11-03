import type { UserBrief } from '@/features/expenses/types.ts';

/** Khớp DTO backend module settlements (Issue #9). Tiền là số nguyên VNĐ. */
export interface PlanMember extends UserBrief {
  /** false = đã rời nhà nhưng còn số dư. */
  active: boolean;
  /** Dương = được nhận, âm = cần trả. */
  net: number;
}

export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface PendingSettlement {
  id: string;
  amount: number;
  createdAt: string;
  proofUrl: string | null;
}

export interface PlanTransfer extends Transfer {
  pending: PendingSettlement | null;
}

export interface SettlementPlan {
  members: PlanMember[];
  /** Nợ chéo từng cặp (sơ đồ "Trước"). */
  raw: Transfer[];
  /** Sau Min Cash Flow (sơ đồ "Sau"). */
  optimized: PlanTransfer[];
  rawTotal: number;
  optimizedTotal: number;
}

export interface PaymentInfo {
  userId: string;
  fullName: string;
  bankBin: string;
  bankAccount: string;
  accountName: string;
}

export type SettlementStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export interface Settlement {
  id: string;
  from: UserBrief;
  to: UserBrief;
  amount: number;
  status: SettlementStatus;
  proofUrl: string | null;
  note: string | null;
  createdAt: string;
  confirmedAt: string | null;
}

export interface SettlementInput {
  toUserId: string;
  amount: number;
  proofUrl?: string;
  note?: string;
}
