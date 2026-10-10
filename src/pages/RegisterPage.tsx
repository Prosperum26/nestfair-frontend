import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, User } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { PasswordInput } from '@/components/ui/PasswordInput.tsx';
import { AuthHeading, AuthLayout } from '@/features/auth/components/AuthLayout.tsx';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter.tsx';
import { useRegister } from '@/features/auth/hooks.ts';
import {
  type RegisterFormInput,
  type RegisterFormValues,
  registerSchema,
} from '@/features/auth/schemas.ts';
import { ApiError } from '@/lib/api.ts';

export function RegisterPage() {
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInput, unknown, RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: { fullName: '', email: '', phone: '', password: '', acceptTerms: false },
  });
  const password = useWatch({ control, name: 'password' });
  const signUp = useRegister();

  // Thành công: GuestRoute thấy phiên mới và chuyển sang /onboarding.
  const onSubmit = handleSubmit(({ fullName, email, phone, password }) =>
    signUp.mutate({ fullName, email, phone, password }, {
      onError: (error) => {
        if (error instanceof ApiError && error.statusCode === 409) {
          setError('email', { message: error.message }, { shouldFocus: true });
        } else {
          toast(error.message);
        }
      },
    }),
  );

  return (
    <AuthLayout
      quote="“Chia tiền điện không còn là chuyện khó nói.”"
      caption="Mỗi khoản chi đều có người trả, cách chia và bằng chứng."
      formWidth={420}
    >
      <AuthHeading title="Tạo tài khoản" description="Một tài khoản dùng được cho nhiều nhà trọ." />

      <form className="flex flex-col" noValidate onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
          <Field label="Họ và tên" htmlFor="register-name" error={errors.fullName?.message}>
            <Input
              id="register-name"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              leftIcon={<User />}
              invalid={!!errors.fullName}
              {...register('fullName')}
            />
          </Field>
          <Field label="Email" htmlFor="register-email" error={errors.email?.message}>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="ban@email.com"
              leftIcon={<Mail />}
              invalid={!!errors.email}
              {...register('email')}
            />
          </Field>
          <Field label="Số điện thoại" htmlFor="register-phone" error={errors.phone?.message}>
            <Input
              id="register-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0901 234 567"
              leftIcon={<Phone />}
              invalid={!!errors.phone}
              {...register('phone')}
            />
          </Field>
          <Field
            label="Mật khẩu"
            htmlFor="register-password"
            error={errors.password?.message}
            hint="Ít nhất 8 ký tự, có chữ hoa và số."
          >
            <PasswordInput
              id="register-password"
              autoComplete="new-password"
              placeholder="Tạo mật khẩu"
              invalid={!!errors.password}
              {...register('password')}
            />
            {password && (
              <div className="mt-1.5">
                <PasswordStrengthMeter password={password} />
              </div>
            )}
          </Field>
        </div>

        <div className="mt-5">
          <Checkbox
            id="register-terms"
            invalid={!!errors.acceptTerms}
            label="Tôi đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư"
            {...register('acceptTerms')}
          />
          {errors.acceptTerms && (
            <p id="register-terms-error" role="alert" className="mt-1.5 text-cap text-tom">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" fullWidth className="mt-[22px]" loading={signUp.isPending}>
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
