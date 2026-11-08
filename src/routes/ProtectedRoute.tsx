import { Navigate, Outlet, useLocation } from 'react-router';
import { DelayedLoader } from '@/components/DelayedLoader.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Chỉ cho vào khi đã đăng nhập; chưa thì về /login và nhớ trang định vào. */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === 'loading') return <DelayedLoader />;
  if (status === 'anonymous') {
    // Giữ cả query (vd. link mời /onboarding?code=K7M2QZ) để đăng nhập xong quay lại đúng chỗ.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return <Outlet />;
}

/**
 * /login, /register: đã đăng nhập (kể cả ngay sau khi submit thành công) thì chuyển vào app ("/" tự chọn Tổng quan hoặc Onboarding),
 * về đúng trang định vào trước đó nếu có.
 */
export function GuestRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === 'loading') return <DelayedLoader />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? '/'} replace />;
  }
  return <Outlet />;
}
