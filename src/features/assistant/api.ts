import { api } from '@/lib/api.ts';
import { toAssistantError } from './errors.ts';
import type { AssistantConsentUser, AssistantMessagesPage, AssistantMessagesParams, SendMessageInput, SendMessageResult } from './types.ts';

export const assistantApi = {
  /** Lịch sử chat riêng tư của chính người gọi; không truyền threadId → backend trả thread mới nhất. */
  messages: (houseId: string, params: AssistantMessagesParams = {}) => {
    const q = new URLSearchParams();
    if (params.threadId) q.set('threadId', params.threadId);
    if (params.cursor) q.set('cursor', params.cursor);
    if (params.limit !== undefined) q.set('limit', String(params.limit));
    const qs = q.toString();
    return api<AssistantMessagesPage>(`/houses/${houseId}/assistant/messages${qs ? `?${qs}` : ''}`);
  },
  /** Gửi một câu; lỗi 429 hạn mức được bọc thành AssistantQuotaError (kèm resetAt khi có). */
  send: async (houseId: string, body: SendMessageInput) => {
    try {
      return await api<SendMessageResult>(`/houses/${houseId}/assistant/messages`, { method: 'POST', body });
    } catch (error) {
      throw toAssistantError(error);
    }
  },
  /** Đồng ý (hoặc rút lại) việc gửi nội dung chat tới Gemini; trả hồ sơ đã cập nhật. */
  setConsent: (enabled: boolean) => api<AssistantConsentUser>('/users/me/assistant-consent', { method: 'PATCH', body: { enabled } }),
};
