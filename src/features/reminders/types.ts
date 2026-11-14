/** Nguồn gốc của nhắc nhở: hệ thống sinh, người dùng tự tạo, hay từ nút hành động của trợ lý. */
export type ReminderSource = 'SYSTEM' | 'USER' | 'ASSISTANT';

/** Khớp ReminderDto (contract issue #12, BE-4). */
export interface ReminderDto {
  id: string;
  houseId: string;
  /** 1–120 ký tự. */
  title: string;
  /** ISO 8601; hiển thị theo giờ Việt Nam (xem format.ts). */
  remindAt: string;
  source: ReminderSource;
  /** null = chưa gửi; backend trả 409 REMINDER_ALREADY_SENT khi sửa nhắc đã gửi. */
  sentAt: string | null;
}

/** GET /reminders?state=…: "upcoming" (mặc định backend) = chưa gửi, remindAt tăng dần. */
export type ReminderState = 'upcoming' | 'all';

export interface ReminderListParams {
  state?: ReminderState;
  limit?: number;
}

export interface ReminderInput {
  houseId: string;
  title: string;
  /** ISO 8601 ở tương lai, không quá 1 năm (dùng isoFromLocalInput để dựng từ form). */
  remindAt: string;
  /** Tạo từ nút hành động CREATE_REMINDER của trợ lý: khóa tin nhắn + vị trí nút (chống bấm hai lần). */
  sourceMessageId?: string;
  actionIndex?: number;
}

export interface ReminderPatch {
  title?: string;
  remindAt?: string;
}
