import type { ExpensePrefill } from './components/ExpenseFormModal.tsx';
import type { ExpenseInput } from './types.ts';

/**
 * Gắn phần đi kèm bản nháp OCR vào body tạo khoản chi: `receiptScanId` (đánh dấu bản nháp đã dùng) và danh sách món của
 * hóa đơn để xem lại. Ở kiểu chia khác "theo món" các món không có người dùng nên `userIds` là [].
 */
export function withPrefillExtras(body: ExpenseInput, prefill: ExpensePrefill | undefined): ExpenseInput {
  if (!prefill) return body;
  return {
    ...body,
    ...(prefill.receiptScanId ? { receiptScanId: prefill.receiptScanId } : {}),
    ...(prefill.items?.length ? { items: prefill.items.map((i) => ({ name: i.name, lineTotal: i.lineTotal, userIds: [] })) } : {}),
  };
}
