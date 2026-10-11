/** Khớp DTO của backend (ngày giờ là chuỗi ISO; ngày làm là "YYYY-MM-DD" theo giờ nhà). */
export type AssignmentStatus =
  | 'TODO'
  | 'PENDING_VERIFY'
  | 'DONE'
  | 'REJECTED'
  | 'MISSED'
  | 'CANCELLED'
  | 'UNASSIGNED';
export type AssignmentSource = 'ROTATION' | 'SWAP' | 'COVER' | 'PAYBACK' | 'WHEEL' | 'REASSIGN';
export type VerifyMode = 'PEER' | 'AUTO_APPROVED' | 'SELF_ATTESTED' | 'ADMIN_OVERRIDE';
export type ChoreFrequency = 'DAILY' | 'WEEKLY' | 'ADHOC';
export type RotationMode = 'WEEK_BLOCK' | 'PER_OCCURRENCE';
export type ScheduleStatus = 'PUBLISHED' | 'LOCKED' | 'EMPTY';
export type GeneratedBy = 'CRON' | 'CATCHUP' | 'USER' | 'ADMIN_REROLL';

export interface Chore {
  id: string;
  title: string;
  weight: number;
  frequency: ChoreFrequency;
  /** ISO 1 = Thứ Hai … 7 = Chủ Nhật. */
  recurrenceDays: number[];
  /** "HH:mm" giờ nhà. */
  dueTime: string;
  rotationMode: RotationMode;
  occurrenceGap: number;
  isActive: boolean;
}

export interface Assignment {
  id: string;
  choreId: string;
  /** Tên và độ nặng lúc sinh lịch (snapshot). */
  choreTitle: string;
  weight: number;
  /** HouseMember.id; null khi chưa có người (UNASSIGNED). */
  assigneeId: string | null;
  /** HouseMember.id người được giao lúc xếp lịch (không đổi khi đổi ca). */
  originalAssigneeId: string | null;
  /** User.id, khớp với auth user và danh sách thành viên. */
  assigneeUserId: string | null;
  assigneeName: string | null;
  assigneeAvatarUrl: string | null;
  weekKey: string;
  /** Thứ Hai của tuần, "YYYY-MM-DD". */
  weekStart: string;
  /** Ngày làm, "YYYY-MM-DD". */
  occurrenceDate: string;
  slotIndex: number;
  dueAt: string;
  status: AssignmentStatus;
  source: AssignmentSource;
  proofImageUrl: string | null;
  submittedAt: string | null;
  /** Nộp trong khoảng ân hạn sau hạn. */
  isLate: boolean;
  rejectCount: number;
  /** HouseMember.id của người duyệt; null nếu duyệt tự động. */
  verifiedById: string | null;
  verifiedAt: string | null;
  verifyMode: VerifyMode | null;
  rejectReason: string | null;
  /** Chờ trưởng phòng quyết (bị từ chối 3 lần hoặc khiếu nại). */
  disputed: boolean;
}

export interface ScheduleMeta {
  id: string;
  weekKey: string;
  weekStart: string;
  /** LOCKED khi tuần đã bắt đầu. */
  status: ScheduleStatus;
  relaxed: boolean;
  relaxLevel: number;
  reasons: string[];
  /** Cửa sổ rào hiệu dụng W_eff (3/2/1). */
  fenceWeeksApplied: number;
  rerollCount: number;
  seed: number;
  generatedBy: GeneratedBy;
  attempts: number;
}

export interface WeekView {
  schedule: ScheduleMeta | null;
  assignments: Assignment[];
}

export interface ShuffleResult extends WeekView {
  /** false nếu không có gì đổi (đã có lịch, hoặc không có phương án khác). */
  changed: boolean;
  message?: string;
}

export interface PreviewSlot {
  choreId: string;
  choreTitle: string;
  occurrenceDate: string;
  memberId: string | null;
  memberUserId: string | null;
  memberName: string | null;
}

export interface PreviewResult {
  seed: number;
  status: 'PUBLISHED' | 'EMPTY';
  relaxed: boolean;
  relaxLevel: number;
  fenceWeeksApplied: number;
  reasons: string[];
  slots: PreviewSlot[];
}

export type VerifyDecision = 'APPROVED' | 'REJECTED';
export type OverrideAction = 'FORCE_DONE' | 'FORCE_REJECT' | 'REASSIGN' | 'CANCEL';

export interface Absence {
  id: string;
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdById: string;
  createdAt: string;
}

export interface HouseBreak {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string | null;
  actorName: string | null;
  assignmentId: string | null;
  scheduleId: string | null;
  detail: Record<string, unknown>;
  createdAt: string;
}

export interface ChoreSettings {
  choreGraceHours: number;
  maxSlotsPerPersonPerDay: number;
}
