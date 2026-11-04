import type { PublicUser } from '@/features/auth/types.ts';

/** Vai trò của dòng chat (contract issue #12, BE-3). */
export type AssistantRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

/** Nhóm chủ đề của tin trợ lý; null khi chưa phân loại. */
export type AssistantCategory = 'TIP' | 'INCIDENT' | 'EMOTIONAL' | 'REMINDER' | 'OTHER';

/** Loại nút hành động gợi ý kèm tin trợ lý; chỉ là nút, người dùng bấm thì client mới gọi API thường. */
export type AssistantActionType = 'CREATE_REMINDER' | 'CREATE_ADHOC_TASK' | 'DRAFT_EXPENSE';

export interface AssistantAction {
  type: AssistantActionType;
  /** Nhãn nút, tối đa 60 ký tự, backend đã làm sạch. */
  label: string;
  payload: { title?: string; remindAt?: string; estimatedAmount?: number };
  /** CREATE_REMINDER đã được bấm (server đổi thành true); loại khác luôn false. */
  done: boolean;
}

export interface AssistantMessageDto {
  id: string;
  threadId: string;
  role: AssistantRole;
  content: string;
  category: AssistantCategory | null;
  actions: AssistantAction[];
  createdAt: string;
}

/** GET /houses/:houseId/assistant/messages: một trang theo cursor, `items` cũ → mới trong trang. */
export interface AssistantMessagesPage {
  items: AssistantMessageDto[];
  nextCursor: string | null;
  /** null khi nhà chưa có hội thoại nào. */
  threadId: string | null;
}

export interface AssistantMessagesParams {
  /** Bỏ trống → thread mới nhất của người gọi. */
  threadId?: string;
  /** Lấy trang cũ hơn; bỏ trống → trang đầu. */
  cursor?: string;
  /** Mặc định backend 30, tối đa 50. */
  limit?: number;
}

export interface SendMessageInput {
  /** 1–1000 ký tự. */
  content: string;
  /** Bỏ trống khi gửi tin đầu tiên của hội thoại mới. */
  threadId?: string;
}

/** POST /houses/:houseId/assistant/messages → 201. */
export interface SendMessageResult {
  threadId: string;
  userMessage: AssistantMessageDto;
  assistantMessage: AssistantMessageDto;
  /** Số câu còn lại trong hạn mức 30 câu/người/ngày. */
  remaining: number;
}

/**
 * PublicUserDto sau PATCH /users/me/assistant-consent: có thêm `assistantConsentAt`.
 * auth/types.ts chưa có trường này nên mở rộng tại chỗ (thẻ FE-1 không sửa file ngoài phạm vi).
 */
export interface AssistantConsentUser extends PublicUser {
  /** Lúc người dùng đồng ý gửi nội dung chat tới Google Gemini; null = chưa đồng ý (chat bị chặn 403). */
  assistantConsentAt: string | null;
}
