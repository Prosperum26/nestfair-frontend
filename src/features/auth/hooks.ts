import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store.ts';
import { authApi, type LoginInput, type RegisterInput } from './api.ts';

/** Phương thức đăng nhập backend đang bật. Lỗi thì coi như tắt Google. */
export function useAuthConfig() {
  return useQuery({
    queryKey: ['auth', 'config'],
    queryFn: authApi.config,
    staleTime: Infinity,
    retry: false,
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: setSession,
  });
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (input: LoginInput) => authApi.login(input),
    onSuccess: setSession,
  });
}

/** Thu hồi refresh token ở server; lỗi mạng vẫn xóa phiên phía client. */
export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
}
