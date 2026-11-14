import { type QueryClient, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bindHouseEvents, type SocketLike } from '@/lib/realtime.ts';
import { getSocket } from '@/lib/socket.ts';
import { listingKeys } from './keys.ts';

/** Event tin đăng do backend phát vào room nhà: tin tự đóng khi nhà đủ người (AGENTS.md mục 5) và tự mở lại khi nhà hết đủ người. */
export const LISTING_EVENTS = ['listing:closed', 'listing:reopened'] as const;

/**
 * Gắn `listing:closed` / `listing:reopened` (và nối lại sau mất mạng) vào việc tải lại tin của nhà. Tách khỏi hook để test bằng
 * socket giả mà không cần dựng React. Socket chỉ báo "có thay đổi": dữ liệu luôn tải lại qua REST.
 * Trả về hàm gỡ; `houseId` rỗng thì không làm gì.
 */
export function bindListingRealtime(
  socket: SocketLike,
  houseId: string | undefined,
  queryClient: Pick<QueryClient, 'invalidateQueries'>,
): () => void {
  if (!houseId) return () => {};
  return bindHouseEvents(socket, houseId, LISTING_EVENTS, () => {
    void queryClient.invalidateQueries({ queryKey: listingKeys.detail(houseId) });
  });
}

/** Trưởng phòng đang mở trang tin đăng: nhà đủ người thì chip trạng thái và banner cập nhật ngay, không cần F5. */
export function useListingRealtime(houseId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => bindListingRealtime(getSocket() as unknown as SocketLike, houseId, queryClient), [houseId, queryClient]);
}
