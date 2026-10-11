/** Khớp AssignmentDto / ChoreDto / ShuffleResultDto của backend (ngày giờ là chuỗi ISO). */
export type AssignmentStatus = 'TODO' | 'PENDING_VERIFY' | 'DONE' | 'REJECTED' | 'MISSED';
export type AssignmentSource = 'AUTO' | 'SHUFFLE';

export interface Chore {
  id: string;
  title: string;
  weight: number;
  frequency: 'WEEKLY';
  isActive: boolean;
}

export interface Assignment {
  id: string;
  choreId: string;
  choreTitle: string;
  weight: number;
  /** HouseMember.id */
  assigneeId: string;
  /** HouseMember.id người được giao lúc xếp lịch (không đổi khi đổi ca). */
  originalAssigneeId: string;
  /** User.id, khớp với auth user và danh sách thành viên. */
  assigneeUserId: string;
  assigneeName: string;
  assigneeAvatarUrl: string | null;
  weekKey: string;
  dueAt: string;
  status: AssignmentStatus;
  source: AssignmentSource;
  proofImageUrl: string | null;
  submittedAt: string | null;
  /** HouseMember.id của người duyệt. */
  verifiedById: string | null;
  verifiedAt: string | null;
  rejectReason: string | null;
}

export interface ShuffleResult {
  assignments: Assignment[];
  /** true nếu phải nới rào 3 tuần. */
  relaxed: boolean;
}

export type VerifyDecision = 'APPROVE' | 'REJECT';
