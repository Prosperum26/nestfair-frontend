import { ApiError } from '@/lib/api.ts';

/**
 * Idempotency-Key của "Đồng ý / Nhận giúp", mỗi yêu cầu một key. Phản hồi bị mất rồi bấm lại phải gửi lại đúng key cũ,
 * để backend trả kết quả đã có thay vì 409 "đã có người nhận" (chính mình là người nhận).
 */
export function createKeyBook(make: () => string = () => crypto.randomUUID()) {
  const keys = new Map<string, string>();
  return {
    keyFor(swapId: string): string {
      let key = keys.get(swapId);
      if (!key) {
        key = make();
        keys.set(swapId, key);
      }
      return key;
    },
    release(swapId: string): void {
      keys.delete(swapId);
    },
  };
}

/** Lỗi 4xx là kết quả dứt khoát của máy chủ nên bỏ key; mất mạng / 5xx chưa biết đã xử lý hay chưa nên giữ key. */
export function shouldReleaseKey(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500;
}

export const acceptKeys = createKeyBook();
