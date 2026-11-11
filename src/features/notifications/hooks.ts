import { type QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { bindHouseEvents, bindUserEvents, type SocketLike } from '@/lib/realtime.ts';
import { getSocket } from '@/lib/socket.ts';
import { notificationsApi } from './api.ts';
import type { NotificationList } from './types.ts';
import { applyRead, NOTIFICATION_EVENTS } from './view.ts';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (houseId: string) => ['notifications', houseId] as const,
};

/** Thông báo của tôi trong nhà đang xem (kèm số chưa đọc cho chấm đỏ trên chuông). */
export function useNotifications(houseId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(houseId ?? ''),
    queryFn: () => notificationsApi.list(houseId!),
    enabled: !!houseId,
  });
}

/**
 * Đổi ngay trên giao diện rồi mới gọi server; lỗi thì trả danh sách về bản cũ. Xong (dù thành công hay lỗi)
 * đều tải lại để khớp server.
 */
function readMutation<TVars>(queryClient: QueryClient, houseId: string, target: (vars: TVars) => string | 'all') {
  const key = notificationKeys.list(houseId);
  return {
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<NotificationList>(key);
      if (previous) queryClient.setQueryData(key, applyRead(previous, target(vars), new Date().toISOString()));
      return { previous };
    },
    onError: (_error: unknown, _vars: TVars, context: { previous?: NotificationList } | undefined) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  };
}

export function useMarkNotificationRead(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    ...readMutation<string>(queryClient, houseId, (id) => id),
  });
}

export function useMarkAllNotificationsRead(houseId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(houseId),
    ...readMutation<void>(queryClient, houseId, () => 'all'),
  });
}

/**
 * Tải lại chuông khi có sự kiện socket có thể sinh thông báo, và khi nối lại. Socket chỉ báo hiệu; nội dung
 * thông báo luôn lấy qua REST.
 */
export function useNotificationRealtime(houseId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!houseId) return;
    const socket = getSocket() as unknown as SocketLike;
    const refetch = () => void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    const offHouse = bindHouseEvents(socket, houseId, NOTIFICATION_EVENTS.house, refetch);
    const offUser = bindUserEvents(socket, NOTIFICATION_EVENTS.user, refetch);
    return () => {
      offHouse();
      offUser();
    };
  }, [houseId, queryClient]);
}
