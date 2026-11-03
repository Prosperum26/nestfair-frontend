import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth-store.ts';
import { assistantApi } from './api.ts';
import type { AssistantMessagesPage, SendMessageInput } from './types.ts';

/** Key cho TanStack Query; tiền tố theo nhà để invalidate một phát là tải lại mọi thread đang cache. */
export const assistantKeys = {
  all: ['assistant'] as const,
  messages: (houseId: string) => ['assistant', houseId, 'messages'] as const,
  /** threadId undefined = thread mới nhất. */
  thread: (houseId: string, threadId: string | undefined) => ['assistant', houseId, 'messages', threadId ?? 'latest'] as const,
};

/**
 * Lịch sử chat của chính người dùng (cursor theo trang cho nút "tải tin cũ hơn" của FE-2).
 * Trang đầu không có cursor; trang sau dùng nextCursor của trang trước. Gọi không có threadId
 * (đang ở thread mới nhất) thì nên truyền lại threadId lấy từ kết quả useSendMessage cho ổn định.
 * `enabled = false` khi người dùng vừa bấm "Cuộc trò chuyện mới": chưa gửi tin nào thì không
 * tải lịch sử, thread bắt đầu trống cho tới khi tin đầu tiên trả về threadId mới.
 */
export function useAssistantMessages(houseId: string | undefined, threadId?: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: assistantKeys.thread(houseId ?? '', threadId),
    queryFn: ({ pageParam }) => assistantApi.messages(houseId!, { threadId, cursor: pageParam }),
    enabled: enabled && !!houseId,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page: AssistantMessagesPage) => page.nextCursor ?? undefined,
  });
}

export function useSendMessage(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageInput) => assistantApi.send(houseId, body),
    // POST đã trả cả hai tin mới; invalidate để trang tin nhắn và done của action luôn khớp server.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: assistantKeys.messages(houseId) }),
  });
}

/** Bật / tắt đồng ý gửi chat cho Gemini; cập nhật hồ sơ trong store để mọi nơi (menu, nút chat) thấy ngay. */
export function useSetAssistantConsent() {
  return useMutation({
    mutationFn: (enabled: boolean) => assistantApi.setConsent(enabled),
    onSuccess: (user) => useAuthStore.getState().setUser(user),
  });
}
