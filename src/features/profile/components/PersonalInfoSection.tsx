import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Phone, Trash2, Upload } from 'lucide-react';
import { type ChangeEvent, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import type { PublicUser } from '@/features/auth/types.ts';
import { profileErrorMessage } from '../errors.ts';
import { useDeleteAvatar, useUpdateProfile, useUploadAvatar } from '../hooks.ts';
import { type ProfileFormValues, profileSchema } from '../schemas.ts';
import { ProfileSection } from './ProfileSection.tsx';

type ProfileInput = z.input<typeof profileSchema>;

export function PersonalInfoSection({ user }: { user: PublicUser }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const update = useUpdateProfile();
  const upload = useUploadAvatar();
  const remove = useDeleteAvatar();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileInput, unknown, ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    // `values` đồng bộ lại form khi hồ sơ trong store đổi (sau khi lưu), không cần effect.
    values: { fullName: user.fullName, phone: user.phone ?? '' },
  });

  const onSubmit = handleSubmit((values) =>
    update.mutate({ fullName: values.fullName, phone: values.phone || null }, {
      onSuccess: () => toast('Đã lưu thông tin cá nhân.'),
      onError: (e) => toast.error(profileErrorMessage(e)),
    }),
  );

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // chọn lại đúng file đó lần sau vẫn kích hoạt onChange
    if (!file) return;
    upload.mutate(file, {
      onSuccess: () => toast('Đã đổi ảnh đại diện.'),
      onError: (err) => toast.error(profileErrorMessage(err)),
    });
  };

  return (
    <ProfileSection id="profile-info" title="Thông tin cá nhân">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar name={user.fullName} tone={avatarToneFor(user.id)} src={user.avatarUrl} size={64} />
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Chọn ảnh đại diện" onChange={onPick} />
            <Button size="sm" variant="secondary" leftIcon={<Upload />} loading={upload.isPending} onClick={() => fileRef.current?.click()}>
              Đổi ảnh
            </Button>
            {user.avatarUrl && (
              <Button size="sm" variant="ghost" leftIcon={<Trash2 />} loading={remove.isPending} onClick={() => remove.mutate(undefined, { onSuccess: () => toast('Đã xóa ảnh đại diện.'), onError: (e) => toast.error(profileErrorMessage(e)) })}>
                Xóa
              </Button>
            )}
          </div>
          <p className="text-cap text-ink-2">PNG, JPG hoặc WEBP. Ảnh được thu nhỏ trước khi tải lên.</p>
        </div>
      </div>

      <form className="mt-6 flex flex-col gap-5" noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Họ và tên" htmlFor="profile-name" error={errors.fullName?.message}>
            <Input id="profile-name" autoComplete="name" invalid={!!errors.fullName} {...register('fullName')} />
          </Field>
          <Field label="Số điện thoại" htmlFor="profile-phone" error={errors.phone?.message}>
            <Input id="profile-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0901 234 567" leftIcon={<Phone />} invalid={!!errors.phone} {...register('phone')} />
          </Field>
        </div>
        <Field label="Email" htmlFor="profile-email" hint="Email dùng để đăng nhập, không thể đổi.">
          <Input id="profile-email" value={user.email} readOnly disabled leftIcon={<Mail />} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </ProfileSection>
  );
}
