import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Divider } from '@/components/ui/Divider.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { PasswordInput } from '@/components/ui/PasswordInput.tsx';
import { AuthHeading, AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import { GoogleButton } from '@/features/auth/components/GoogleButton.tsx';
import { GOOGLE_LOGIN_URL } from '@/features/auth/api.ts';
import { useAuthConfig, useLogin } from '@/features/auth/hooks.ts';
import { type LoginFormValues, loginSchema } from '@/features/auth/schemas.ts';
import { ApiError } from '@/lib/api.ts';

export function LoginPage() {
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: { email: '', password: '', rememberMe: true },
  });
  const login = useLogin();
  const authConfig = useAuthConfig();
  const [redirecting, setRedirecting] = useState(false);
  // 401 hiện ngay trên form; lỗi khác (mất mạng, 500) đi qua toast.
  const credentialsError =
    login.error instanceof ApiError && login.error.statusCode === 401
      ? login.error.message
      : null;

  // Thành công: GuestRoute thấy phiên mới và chuyển về trang định vào (hoặc /onboarding).
  const onSubmit = handleSubmit((values) =>
    login.mutate(values, {
      onError: (error) => {
        if (!(error instanceof ApiError && error.statusCode === 401)) toast(error.message);
      },
    }),
  );

  return (
    <AuthLayout
      quote="“Không ai phải nhắc ai trả tiền nữa.”"
      caption="Nhà 12A · 4 người · tháng thứ 3 dùng NestFair"
    >
      <AuthHeading title="Chào mừng trở lại" description="Đăng nhập để xem sổ chung của nhà bạn." />

      <form className="flex flex-col" noValidate onSubmit={onSubmit}>
        {credentialsError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-btn bg-tom-bg px-3.5 py-3 text-sm text-tom"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {credentialsError}
          </div>
        )}

        <div className="flex flex-col gap-6">
          <Field label="Email" htmlFor="login-email" error={errors.email?.message}>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              leftIcon={<Mail />}
              invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field
            label="Mật khẩu"
            htmlFor="login-password"
            error={errors.password?.message}
            labelAction={
              <button
                type="button"
                className="text-sm font-medium text-ink underline decoration-[1.5px] underline-offset-[3px]"
                onClick={() => toast('Tính năng quên mật khẩu sẽ có trong bản sau.')}
              >
                Quên mật khẩu?
              </button>
            }
          >
            <PasswordInput
              id="login-password"
              autoComplete="current-password"
              placeholder="Mật khẩu"
              invalid={!!errors.password}
              {...register('password')}
            />
          </Field>
        </div>

        <Checkbox
          id="login-remember"
          className="mt-[18px]"
          label="Ghi nhớ đăng nhập trên thiết bị này"
          {...register('rememberMe')}
        />

        <Button type="submit" size="lg" fullWidth className="mt-[22px]" loading={login.isPending}>
          Đăng nhập
        </Button>
      </form>

      {/* Chỉ hiện khi backend đã cấu hình GOOGLE_CLIENT_ID + SECRET. */}
      {authConfig.data?.googleEnabled && (
        <>
          <div className="my-7">
            <Divider label="hoặc" />
          </div>
          <GoogleButton
            loading={redirecting}
            onClick={() => {
              setRedirecting(true);
              window.location.assign(GOOGLE_LOGIN_URL);
            }}
          />
        </>
      )}

      <p className="mt-8 text-center text-sm text-ink-2">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          state={location.state}
          className="font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]"
        >
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
