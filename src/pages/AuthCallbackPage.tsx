import { TriangleAlert } from 'lucide-react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { SessionLoader } from '@/components/SessionLoader.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';

const ERRORS: Record<string, string> = {
  email_unverified: 'Tài khoản Google này chưa xác minh email. Hãy dùng tài khoản khác hoặc đăng ký bằng email.',
  google_failed: 'Không đăng nhập được bằng Google. Bạn thử lại hoặc dùng email và mật khẩu nhé.',
};

/**
 * Backend chuyển về đây sau khi đăng nhập Google. Cookie refresh token đã được đặt,
 * main.tsx tự khôi phục phiên khi trang tải; trang này chỉ chờ kết quả rồi điều hướng.
 */
export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const errorCode = params.get('error');

  if (!errorCode && status === 'loading') return <SessionLoader label="Đang hoàn tất đăng nhập Google" />;
  if (!errorCode && status === 'authenticated') return <Navigate to="/onboarding" replace />;

  const message = ERRORS[errorCode ?? ''] ?? ERRORS.google_failed;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-paper px-4">
      <Logo />
      <div className="w-full max-w-[400px] rounded-card border border-line bg-surface p-6 text-center">
        <span className="mx-auto flex size-11 items-center justify-center rounded-btn bg-tom-bg text-tom">
          <TriangleAlert className="size-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-ct text-ink">Chưa đăng nhập được</h1>
        <p role="alert" className="mt-2 text-sm text-ink-2">
          {message}
        </p>
        <Link
          to="/login"
          replace
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-btn bg-ink text-btn text-white"
        >
          Về trang đăng nhập
        </Link>
      </div>
    </div>
  );
}
