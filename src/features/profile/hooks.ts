import { useMutation } from '@tanstack/react-query';
import type { PublicUser } from '@/features/auth/types.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { type ChangePasswordInput, profileApi, type UpdateProfileInput } from './api.ts';
import { prepareAvatar } from './avatar-upload.ts';
import type { NotificationPrefs } from './notification-prefs.ts';

/** Mọi mutation trả hồ sơ mới: đưa vào store để menu, thẻ thành viên, trang thanh toán thấy ngay. */
const setUser = (user: PublicUser) => useAuthStore.getState().setUser(user);

export function useUpdateProfile() {
  return useMutation({ mutationFn: (input: UpdateProfileInput) => profileApi.update(input), onSuccess: setUser });
}

export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const photo = await prepareAvatar(file);
      return profileApi.uploadAvatar(photo, photo.name);
    },
    onSuccess: setUser,
  });
}

export function useDeleteAvatar() {
  return useMutation({ mutationFn: () => profileApi.deleteAvatar(), onSuccess: setUser });
}

export function useSetNotifications() {
  return useMutation({ mutationFn: (prefs: Partial<NotificationPrefs>) => profileApi.setNotifications(prefs), onSuccess: setUser });
}

export function useChangePassword() {
  return useMutation({ mutationFn: (input: ChangePasswordInput) => profileApi.changePassword(input) });
}
