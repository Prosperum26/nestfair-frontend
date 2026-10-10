import { api, API_BASE } from '@/lib/api.ts';
import type { AuthResponse, PublicUser } from './types.ts';

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthConfig {
  googleEnabled: boolean;
}

/** Trang bắt đầu đăng nhập Google (điều hướng cả trang, không gọi fetch). */
export const GOOGLE_LOGIN_URL = `${API_BASE}/auth/google`;

export const authApi = {
  config: () => api<AuthConfig>('/auth/config', { auth: false }),
  register: (body: RegisterInput) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  login: (body: LoginInput) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),
  logout: () => api<void>('/auth/logout', { method: 'POST', auth: false }),
  me: () => api<PublicUser>('/auth/me'),
};
