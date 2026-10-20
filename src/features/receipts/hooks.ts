import { useMutation } from '@tanstack/react-query';
import { receiptsApi } from './api.ts';

/**
 * Quét một ảnh hóa đơn. Không invalidate danh sách chi: lần quét chỉ tạo bản nháp, khoản chi chỉ có khi
 * người dùng bấm Lưu (lúc đó `useCreateExpense` sẽ tải lại sổ).
 */
export function useScanReceipt(houseId: string | undefined) {
  return useMutation({
    mutationFn: ({ photo, filename }: { photo: Blob; filename: string }) => receiptsApi.scan(houseId!, photo, filename),
  });
}
