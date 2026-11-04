import { zodResolver } from '@hookform/resolvers/zod';
import { TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { PasswordInput } from '@/components/ui/PasswordInput.tsx';
import { ApiError } from '@/lib/api.ts';
import { profileErrorMessage } from '../errors.ts';
import { useChangePassword } from '../hooks.ts';
import { type PasswordFormValues, passwordSchema } from '../schemas.ts';
import { ProfileSection } from './ProfileSection.tsx';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

export function SecuritySection() {
  const change = useChangePassword();
  const [notice, setNotice] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema), mode: 'onTouched', defaultValues: EMPTY });

  const onSubmit = handleSubmit((values) => {
    setNotice(null);
    change.mutate(
      { currentPassword: values.currentPassword, newPassword: values.newPassword },
      {
        onSuccess: () => {
          reset(EMPTY);
          toast('Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.');
        },
        onError: (e) => {
          const code = e instanceof ApiError ? e.code : undefined;
          if (code === 'WRONG_PASSWORD') setError('currentPassword', { message: profileErrorMessage(e) });
          else if (code === 'SAME_PASSWORD') setError('newPassword', { message: profileErrorMessage(e) });
          else if (code === 'PASSWORD_NOT_SET') setNotice(profileErrorMessage(e));
          else toast.error(profileErrorMessage(e));
        },
      },
    );
  });

  return (
    <ProfileSection id="profile-security" overline="Mật khẩu đăng nhập" title="Bảo mật">
      <form noValidate onSubmit={onSubmit} className="flex max-w-[460px] flex-col gap-5">
        {notice && (
          <div role="alert" className="flex items-start gap-2.5 rounded-btn bg-tom-bg px-3.5 py-3 text-sm text-tom">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {notice}
          </div>
        )}
        <Field label="Mật khẩu hiện tại" htmlFor="pw-current" error={errors.currentPassword?.message}>
          <PasswordInput id="pw-current" autoComplete="current-password" invalid={!!errors.currentPassword} {...register('currentPassword')} />
        </Field>
        <Field label="Mật khẩu mới" htmlFor="pw-new" error={errors.newPassword?.message} hint="Ít nhất 8 ký tự, có chữ hoa và số.">
          <PasswordInput id="pw-new" autoComplete="new-password" invalid={!!errors.newPassword} {...register('newPassword')} />
        </Field>
        <Field label="Nhập lại mật khẩu mới" htmlFor="pw-confirm" error={errors.confirm?.message}>
          <PasswordInput id="pw-confirm" autoComplete="new-password" invalid={!!errors.confirm} {...register('confirm')} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={change.isPending}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </ProfileSection>
  );
}
