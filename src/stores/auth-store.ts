import { create } from 'zustand';

/** Access token chỉ giữ trong bộ nhớ (không localStorage). Refresh token nằm trong cookie httpOnly. */
interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (accessToken) => set({ accessToken }),
}));
