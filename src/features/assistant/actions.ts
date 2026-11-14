import { prefillTitle } from '@/features/wheel/selection.ts';
import type { ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import type { AssistantAction, AssistantMessageDto } from './types.ts';

/**
 * Mô tả việc sẽ làm khi người dùng BẤM một nút hành động của trợ lý (luật sống còn issue #12:
 * AI không tự ghi — bấm nút mới có lời gọi API, và hàm này chỉ "mô tả" lời gọi, không thực thi).
 * Hàm thuần để unit test mọi nhánh trước khi gắn vào UI.
 */
export type AssistantActionRequest =
  | {
      kind: 'create-reminder';
      /** Khóa tin nhắn + vị trí nút để backend chống tạo đúp (409 REMINDER_ALREADY_CREATED). */
      sourceMessageId: string;
      actionIndex: number;
      title: string;
      /** ISO 8601 đã qua kiểm tra hợp lệ (thiếu / quá khứ / sai định dạng đều không tới đây). */
      remindAt: string;
    }
  | { kind: 'invalid-time' }
  | { kind: 'open-expense-draft'; prefill: ExpensePrefill }
  /** Rời chat, sang Việc nhà mở Vòng quay với tên việc điền sẵn; người dùng tự chọn người, hạn và bấm Quay. */
  | { kind: 'open-wheel'; title: string; sourceKey: string };

/**
 * Ánh xạ nút hành động → việc cần làm:
 * - CREATE_REMINDER → lời gọi POST /reminders kèm sourceMessageId/actionIndex; `remindAt` thiếu,
 *   sai định dạng hoặc đã qua (so với `now`) thì trả invalid-time để UI báo "nhập lại giờ", không gọi API.
 * - DRAFT_EXPENSE → chỉ mở ExpenseFormModal với prefill; người dùng bấm Lưu mới tạo khoản chi.
 * - CREATE_ADHOC_TASK → chỉ chuyển sang Vòng quay kèm tên việc; vòng quay chỉ chạy khi người dùng bấm Quay.
 */
export function actionRequest(action: AssistantAction, message: AssistantMessageDto, index: number, now: Date = new Date()): AssistantActionRequest {
  switch (action.type) {
    case 'CREATE_REMINDER': {
      const remindAt = action.payload.remindAt;
      const at = remindAt ? new Date(remindAt) : null;
      if (!remindAt || !at || Number.isNaN(at.getTime()) || at.getTime() <= now.getTime()) return { kind: 'invalid-time' };
      return {
        kind: 'create-reminder',
        sourceMessageId: message.id,
        actionIndex: index,
        title: action.payload.title ?? action.label,
        remindAt,
      };
    }
    case 'DRAFT_EXPENSE':
      return {
        kind: 'open-expense-draft',
        prefill: {
          title: action.payload.title ?? action.label,
          totalAmount: action.payload.estimatedAmount ?? null,
        },
      };
    case 'CREATE_ADHOC_TASK':
      return { kind: 'open-wheel', title: prefillTitle(action.payload.title ?? ''), sourceKey: `${message.id}:${index}` };
  }
}
