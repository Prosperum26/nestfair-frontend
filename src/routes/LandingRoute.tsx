import { SessionLoader } from '@/components/SessionLoader.tsx';
import { LandingPage } from '@/pages/LandingPage.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';
import { HomeRedirect } from './RequireHouse.tsx';

/** "/": đã đăng nhập thì vào app như cũ (Tổng quan hoặc Onboarding), chưa đăng nhập thì xem landing. */
export function LandingRoute() {
  const status = useAuthStore((s) => s.status);
  if (status === 'loading') return <SessionLoader />;
  if (status === 'authenticated') return <HomeRedirect />;
  return <LandingPage />;
}
