import { create } from 'zustand';
import type { AuthResponse, PublicUser } from '@/features/auth/types.ts';

/**
 * Phiên đăng nhập. Access token chỉ giữ trong bộ nhớ (không localStorage);
 * refresh token nằm trong cookie httpOnly do backend đặt.
 * status = 'loading' cho tới khi lần khôi phục phiên đầu tiên xong.
 */
interface AuthState {
  status: 'loading' | 'authenticated' | 'anonymous';
  accessToken: string | null;
  user: PublicUser | null;
  setSession: (res: AuthResponse) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  accessToken: null,
  user: null,
  setSession: ({ accessToken, user }) =>
    set({ status: 'authenticated', accessToken, user }),
  clearSession: () =>
    set({ status: 'anonymous', accessToken: null, user: null }),
}));
