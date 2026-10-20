export interface WheelPerson {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export type WheelStatus = 'SPINNING' | 'REVEALED' | 'VOIDED';

export interface WheelSpin {
  spinId: string;
  taskTitle: string;
  dueAt: string;
  status: WheelStatus;
  spunBy: WheelPerson;
  participants: WheelPerson[];
  excludedCount: number;
  slices: string[];
  landingIndex: number;
  seed: number;
  startAt: string;
  durationMs: number;
  revealAt: string;
  serverNow: string;
  winner: WheelPerson | null;
  assignmentId: string | null;
  winnerSlotsToday: number;
  voidReason: string | null;
}

export type DueKey = 'IN_2H' | 'TONIGHT' | 'END_OF_DAY' | 'TOMORROW';

export interface DueOption {
  key: DueKey;
  label: string;
  dueAt: string;
  valid: boolean;
  reason: string | null;
}

export interface WheelOptions {
  members: (WheelPerson & { absentToday: boolean })[];
  defaultParticipantIds: string[];
  dueOptions: DueOption[];
  defaultDueKey: DueKey | null;
  remaining: { hour: number; day: number };
  houseOnBreak: boolean;
  busySpinId: string | null;
  serverNow: string;
}

/** Vòng đang hiển thị kèm lệch đồng hồ đo lúc nhận (giờ server − giờ máy). */
export interface ActiveSpin {
  spin: WheelSpin;
  clockOffsetMs: number;
}
