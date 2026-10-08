import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from '@/stores/auth-store.ts';

// Placeholder. Bước sau: khi mở app gọi /auth/refresh để khôi phục phiên trước khi quyết định chuyển hướng.
export function ProtectedRoute() {
  const accessToken = useAuthStore((s) => s.accessToken);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <Outlet />;
}
