import type { AssignmentStatus } from '@/features/chores/types.ts';

/** Khớp DTO của backend (src/modules/swaps/dto). Ngày giờ là chuỗi ISO; `occurrenceDate` là "YYYY-MM-DD" giờ nhà. */
export type SwapType = 'EXCHANGE' | 'COVER' | 'PERMANENT';
export type SwapStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';
export type Compensation = 'PAYBACK' | 'GIFT';
export type SwapScope = 'INCOMING' | 'OUTGOING' | 'MARKET';
export type SwapResolution =
  | 'ACCEPTED_BY_TARGET'
  | 'REJECTED_BY_TARGET'
  | 'CANCELLED_BY_REQUESTER'
  | 'EXPIRED_NO_TAKER'
  | 'ESCALATED'
  | 'SLOT_CHANGED'
  | 'REQUESTER_DID_IT'
  | 'MEMBER_LEFT'
  | 'CHORE_DISABLED'
  | 'HOUSE_BREAK'
  | 'ADMIN_OVERRIDE';

/** Cảnh báo mềm: người dùng phải tick xác nhận trước khi gửi (acknowledgedWarnings). */
export type SwapWarning = 'WEIGHT_GAP' | 'FENCE_REPEAT' | 'OVER_DAILY_CAP' | 'CONSECUTIVE_DAY' | 'DUE_SOON';

export interface SwapSlot {
  id: string;
  choreTitle: string;
  occurrenceDate: string;
  dueAt: string;
  weight: number;
  /** HouseMember.id đang giữ ca. */
  assigneeId: string | null;
}

export interface Eligibility {
  canAccept: boolean;
  reasonCode?: string;
  /** Câu tiếng Việt để hiển thị. */
  reasonText?: string;
}

export interface Swap {
  id: string;
  type: SwapType;
  status: SwapStatus;
  resolution: SwapResolution | null;
  /** HouseMember.id. */
  requesterMemberId: string;
  requesterName: string;
  /** null = Chợ ca. */
  targetMemberId: string | null;
  targetName: string | null;
  fromAssignment: SwapSlot | null;
  toAssignment: SwapSlot | null;
  compensation: Compensation | null;
  rewardNote: string | null;
  /** VNĐ, số nguyên. */
  rewardAmount: number | null;
  /** Chỉ người gửi, người nhận và trưởng phòng thấy (còn lại là null). */
  reason: string | null;
  note: string | null;
  rejectReason: string | null;
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
  rootRequestId: string;
  /** true = đăng lên Chợ ca. */
  market: boolean;
  /** Chỉ có ở scope MARKET. */
  eligibility?: Eligibility;
}

export interface SwapSummary {
  incoming: number;
  market: number;
  debtsOwedByMe: number;
  debtsOwedToMe: number;
}

export interface AcceptResult {
  swap: Swap;
  alreadyDone: boolean;
}

export interface EscalateResult {
  swap: Swap;
  newSwap?: Swap;
}

export type EscalateAction = 'ADD_REWARD' | 'RESEND' | 'SELF';

export type OptionType = 'EXCHANGE' | 'COVER';

export interface SwapOption {
  /** EXCHANGE: ca đích. */
  assignmentId?: string;
  /** HouseMember.id của người nhận / chủ ca đích. */
  memberId: string;
  memberName: string;
  choreTitle?: string;
  occurrenceDate?: string;
  dueAt?: string;
  weight?: number;
  valid: boolean;
  /** Mã lỗi chuẩn; chỉ để chọn biểu tượng, câu hiển thị là `reasonText`. */
  reasonCode?: string;
  detailCode?: string;
  reasonText?: string;
  warnings: SwapWarning[];
}

export interface SwapOptions {
  type: OptionType;
  options: SwapOption[];
  market: { allowed: boolean; reasonText: string | null };
}

// ---- Sổ nợ ca ----

export type DebtStatus = 'OPEN' | 'PAID' | 'FORGIVEN' | 'CANCELLED';
/** Chỉ có nghĩa với nợ OPEN. */
export type DebtPhase = 'WAITING_COVER' | 'WAITING_SCHEDULE' | 'PICK_WINDOW' | 'PAYBACK_ASSIGNED';
export type DebtScope = 'mine' | 'all';

export interface Debt {
  id: string;
  debtorMemberId: string;
  debtorName: string;
  creditorMemberId: string;
  creditorName: string;
  weight: number;
  status: DebtStatus;
  /** OFFSET, STALE, FORGIVEN_BY_CREDITOR, COVER_MISSED, ADMIN_REASSIGN… null khi còn OPEN. */
  closeReason: string | null;
  settledAt: string | null;
  phase: DebtPhase;
  coverAssignment: { id: string; choreTitle: string; occurrenceDate: string; status: AssignmentStatus } | null;
  pickOpensAt: string | null;
  pickDeadlineAt: string | null;
  pickAttempts: number;
  paybackAssignmentId: string | null;
  createdAt: string;
}

/** Nhóm theo cặp có hướng (người nợ, người được nợ); không bù trừ ròng. `openWeight` là độ nặng (ca), không phải VNĐ. */
export interface DebtGroup {
  debtorMemberId: string;
  debtorName: string;
  creditorMemberId: string;
  creditorName: string;
  openWeight: number;
  debts: Debt[];
}

export interface DebtGroupsResponse {
  groups: DebtGroup[];
  /** true khi có nhóm bị cắt do vượt 100 nhóm. */
  truncated: boolean;
}

export interface PaybackOption {
  assignmentId: string;
  choreTitle: string;
  occurrenceDate: string;
  dueAt: string;
  weight: number;
  /** weight của ca − weight còn nợ. */
  weightDiff: number;
  valid: boolean;
  reasonCode?: string;
  reasonText?: string;
}

export interface PaybackOptions {
  debtId: string;
  weight: number;
  pickOpensAt: string | null;
  pickDeadlineAt: string | null;
  options: PaybackOption[];
}

export interface PaybackResult {
  debtId: string;
  paybackAssignmentId: string;
  alreadyDone: boolean;
}
