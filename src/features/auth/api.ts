import { api } from '@/lib/api.ts';
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

export const authApi = {
  register: (body: RegisterInput) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body, auth: false }),
  login: (body: LoginInput) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body, auth: false }),
  logout: () => api<void>('/auth/logout', { method: 'POST', auth: false }),
  me: () => api<PublicUser>('/auth/me'),
};
