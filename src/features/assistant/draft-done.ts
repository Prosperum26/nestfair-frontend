import { createDoneKeys } from '@/lib/done-keys.ts';

/**
 * Nút DRAFT_EXPENSE không có khóa chống trùng ở server (khoản chi do người dùng bấm Lưu trong form),
 * nên "đã ghi" chỉ là tiện ích theo trình duyệt (xem createDoneKeys).
 */
const expenseDone = createDoneKeys('nestfair.assistant.expense-done');

export const draftKey = (messageId: string, actionIndex: number) => `${messageId}:${actionIndex}`;

/** Đánh dấu nút khoản chi đã được lưu. */
export const markDraftDone = expenseDone.mark;

/** Danh sách khóa đã lưu; đổi tham chiếu mỗi khi có khóa mới để React render lại. */
export const useDraftDoneKeys = expenseDone.useKeys;
