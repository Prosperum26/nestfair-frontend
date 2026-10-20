import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store.ts';
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

/** Bật / tắt đồng ý gửi ảnh cho Gemini; cập nhật hồ sơ trong store để mọi nơi (menu, nút quét) thấy ngay. */
export function useSetOcrConsent() {
  return useMutation({
    mutationFn: (enabled: boolean) => receiptsApi.setOcrConsent(enabled),
    onSuccess: (user) => useAuthStore.getState().setUser(user),
  });
}
