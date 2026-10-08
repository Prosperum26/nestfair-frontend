import { Navigate, Outlet, useLocation } from 'react-router';
import { SessionLoader } from '@/components/SessionLoader.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Chỉ cho vào khi đã đăng nhập; chưa thì về /login và nhớ trang định vào. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === 'loading') return <SessionLoader />;
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/**
 * /login, /register: đã đăng nhập (kể cả ngay sau khi submit thành công) thì chuyển vào app,
 * về đúng trang định vào trước đó nếu có.
 */
export function GuestRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === 'loading') return <SessionLoader />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/onboarding'} replace />;
  }
  return <Outlet />;
}
