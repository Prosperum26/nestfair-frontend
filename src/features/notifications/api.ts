import { api } from '@/lib/api.ts';
import type { NotificationDto, NotificationList } from './types.ts';

const query = (houseId: string) => `?houseId=${encodeURIComponent(houseId)}`;

/** Hộp thông báo của chính người gọi, lọc theo nhà đang xem. */
export const notificationsApi = {
  list: (houseId: string) => api<NotificationList>(`/notifications${query(houseId)}`),
  markRead: (id: string) => api<NotificationDto>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: (houseId: string) => api<{ updated: number }>(`/notifications/read-all${query(houseId)}`, { method: 'POST' }),
};
