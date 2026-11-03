import { createDoneKeys } from '@/lib/done-keys.ts';

/**
 * Nút CREATE_ADHOC_TASK chỉ đưa người dùng sang Vòng quay; server không biết vòng quay nào đến từ nút nào,
 * nên "đã tạo" là tiện ích theo trình duyệt (xem createDoneKeys). Khóa cùng dạng với draftKey: `messageId:actionIndex`.
 */
const adhocDone = createDoneKeys('nestfair.assistant.adhoc-done');

/** Đánh dấu nút việc đột xuất đã được quay thành công. */
export const markAdhocDone = adhocDone.mark;

/** Danh sách khóa đã quay; đổi tham chiếu mỗi khi có khóa mới để React render lại. */
export const useAdhocDoneKeys = adhocDone.useKeys;
