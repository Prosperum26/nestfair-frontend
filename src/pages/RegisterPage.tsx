import { Mail, Phone, User } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { PasswordInput } from '@/components/ui/PasswordInput.tsx';
import { AuthHeading, AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter.tsx';

// Bước 4: giao diện tĩnh theo preview 03. Bước 5 nối React Hook Form + Zod + API.
export function RegisterPage() {
  const [password, setPassword] = useState('');

  return (
    <AuthLayout
      quote="“Chia tiền điện không còn là chuyện khó nói.”"
      caption="Mỗi khoản chi đều có người trả, cách chia và bằng chứng."
      formWidth={420}
    >
      <AuthHeading title="Tạo tài khoản" description="Một tài khoản dùng được cho nhiều nhà trọ." />

      <form className="flex flex-col" noValidate onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-5">
          <Field label="Họ và tên" htmlFor="register-name">
            <Input
              id="register-name"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              leftIcon={<User />}
            />
          </Field>
          <Field label="Email" htmlFor="register-email">
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              leftIcon={<Mail />}
            />
          </Field>
          <Field label="Số điện thoại" htmlFor="register-phone">
            <Input
              id="register-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0901 234 567"
              leftIcon={<Phone />}
            />
          </Field>
          <Field
            label="Mật khẩu"
            htmlFor="register-password"
            hint="Ít nhất 8 ký tự, có chữ hoa và số."
          >
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              placeholder="Tạo mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password && (
              <div className="mt-1.5">
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </Field>
        </div>

        <Checkbox
          id="register-terms"
          className="mt-5"
          label="Tôi đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư"
        />

        <Button type="submit" size="lg" fullWidth className="mt-[22px]">
          Tạo tài khoản
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-ink-2">
        Đã có tài khoản?{' '}
        <Link
          to="/login"
          className="font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]"
        >
          Đăng nhập
        </Link>
      </p>
    </AuthLayout>
  );
}
