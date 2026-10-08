import { Mail } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Divider } from '@/components/ui/Divider.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { PasswordInput } from '@/components/ui/PasswordInput.tsx';
import { AuthHeading, AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import { GoogleButton } from '@/features/auth/components/GoogleButton.tsx';

// Bước 4: giao diện tĩnh theo preview 02. Bước 6 nối React Hook Form + Zod + API.
export function LoginPage() {
  return (
    <AuthLayout
      quote="“Không ai phải nhắc ai trả tiền nữa.”"
      caption="Nhà 12A · 4 người · tháng thứ 3 dùng NestFair"
    >
      <AuthHeading title="Chào mừng trở lại" description="Đăng nhập để xem sổ chung của nhà bạn." />

      <form className="flex flex-col" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-6">
          <Field label="Email" htmlFor="login-email">
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              leftIcon={<Mail />}
            />
          </Field>
          <Field
            label="Mật khẩu"
            htmlFor="login-password"
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
            <PasswordInput id="login-password" autoComplete="current-password" placeholder="Mật khẩu" />
          </Field>
        </div>

        <Checkbox
          id="login-remember"
          defaultChecked
          className="mt-[18px]"
          label="Ghi nhớ đăng nhập trên thiết bị này"
        />

        <Button type="submit" size="lg" fullWidth className="mt-[22px]">
          Đăng nhập
        </Button>
      </form>

      <div className="my-7">
        <Divider label="hoặc" />
      </div>
      <GoogleButton />

      <p className="mt-8 text-center text-sm text-ink-2">
        Chưa có tài khoản?{' '}
        <Link
          to="/register"
          className="font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]"
        >
          Đăng ký
        </Link>
      </p>
    </AuthLayout>
  );
}
