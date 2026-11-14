import { ApiError } from '@/lib/api.ts';
import { vnTime } from '@/features/reminders/format.ts';

/**
 * 429 hết hạn mức chat (30 câu/người/ngày). `resetAt` là lúc đặt lại hạn mức (00:00 giờ VN hôm sau)
 * nếu backend gửi kèm; lib/api.ts hiện chỉ giữ statusCode/message/code trong ApiError nên thường là
 * null — khi nào ApiError mang được body lỗi thì toAssistantError tự nhặt ra, caller không phải sửa.
 */
export class AssistantQuotaError extends ApiError {
  constructor(origin: ApiError, public readonly resetAt: string | null = null) {
    super(origin.statusCode, origin.message, origin.code);
    this.name = 'AssistantQuotaError';
  }
}

/** Bọc 429 hạn mức thành AssistantQuotaError (nhặt resetAt nếu ApiError có); lỗi khác giữ nguyên. */
export function toAssistantError(error: unknown): unknown {
  if (!(error instanceof ApiError) || error.code !== 'ASSISTANT_QUOTA_EXCEEDED') return error;
  const resetAt = (error as ApiError & { resetAt?: unknown }).resetAt;
  return new AssistantQuotaError(error, typeof resetAt === 'string' ? resetAt : null);
}

/** Mã lỗi trợ lý + nhắc nhở (README backend, Issue #12) → câu tiếng Việt cho người dùng. */
const MESSAGES: Record<string, string> = {
  ASSISTANT_QUOTA_EXCEEDED: 'Hôm nay bạn đã hỏi đủ 30 câu rồi. Mai mình trò chuyện tiếp nhé.',
  ASSISTANT_CONSENT_REQUIRED: 'Bạn chưa cho phép gửi nội dung trò chuyện tới Google Gemini. Hãy bật ở phần cài đặt trợ lý nhé.',
  REMINDER_ALREADY_CREATED: 'Bạn đã tạo nhắc nhở này rồi.',
  REMIND_AT_INVALID: 'Thời gian nhắc phải sau hiện tại và trong vòng 1 năm tới.',
  REMINDER_ALREADY_SENT: 'Nhắc nhở này đã gửi rồi nên không sửa được.',
  REMINDER_NOT_DELETABLE: 'Nhắc của hệ thống không xóa được.',
};

export function assistantErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const msg = error.code ? MESSAGES[error.code] : undefined;
    if (msg) {
      if (error instanceof AssistantQuotaError && error.resetAt) return `${msg} Hạn mức đặt lại lúc ${vnTime(error.resetAt)} giờ VN.`;
      return msg;
    }
    return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Trợ lý đang bận, thử lại sau ít phút nhé.';
}
