import type { PublicUser } from '@/features/auth/types.ts';
import { api } from '@/lib/api.ts';
import type { NotificationPrefs } from './notification-prefs.ts';

/** Chỉ field có gửi mới đổi; null xóa giá trị (SĐT, ngân hàng + STK đi theo cặp). */
export interface UpdateProfileInput {
  fullName?: string;
  phone?: string | null;
  bankBin?: string | null;
  bankAccount?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  update: (body: UpdateProfileInput) => api<PublicUser>('/users/me', { method: 'PATCH', body }),
  /** Ảnh nên được nén trước (`prepareAvatar`). */
  uploadAvatar: (photo: Blob, filename: string) => {
    const body = new FormData();
    body.append('avatar', photo, filename);
    return api<PublicUser>('/users/me/avatar', { method: 'POST', body });
  },
  deleteAvatar: () => api<PublicUser>('/users/me/avatar', { method: 'DELETE' }),
  setNotifications: (body: Partial<NotificationPrefs>) => api<PublicUser>('/users/me/notifications', { method: 'PATCH', body }),
  changePassword: (body: ChangePasswordInput) => api<void>('/auth/change-password', { method: 'POST', body }),
};
