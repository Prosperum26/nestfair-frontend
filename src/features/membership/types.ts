import type { HouseRole } from '@/features/houses/types.ts';

/** Khớp LeavePreviewDto backend. Tiền là số nguyên VNĐ. */
export interface LeavePreview {
  userId: string;
  fullName: string;
  role: HouseRole;
  /** Dương = được nhận, âm = cần trả. */
  net: number;
  pendingSettlements: number;
  openChoreDebts: number;
  futureShifts: number;
  isLastMember: boolean;
}

export type AdjustmentMode = 'WRITE_OFF' | 'TRANSFER';
/** Ca sắp tới của người rời: hệ thống tự chia hay để trống cho trưởng phòng gán. */
export type ShiftMode = 'AUTO' | 'MANUAL';

export interface KickInput {
  mode?: AdjustmentMode;
  toUserId?: string;
  shifts: ShiftMode;
}

export interface RemoveMemberResult {
  userId: string;
  adjustment: { kind: AdjustmentMode; amount: number; toUserId: string | null } | null;
  shifts: ShiftMode;
  futureShifts: number;
}
