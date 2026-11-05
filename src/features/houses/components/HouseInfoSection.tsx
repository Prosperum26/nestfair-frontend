import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin } from 'lucide-react';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { ProfileSection } from '@/features/profile/components/ProfileSection.tsx';
import { useUpdateHouse } from '../hooks.ts';
import { houseInfoSchema, type HouseInfoValues } from '../schemas.ts';
import type { HouseDetail } from '../types.ts';

/** "Thông tin nhà": tên, địa chỉ, số người tối đa (không thấp hơn số người đang ở). */
export function HouseInfoSection({ house }: { house: HouseDetail }) {
  const update = useUpdateHouse(house.id);
  const activeCount = house.members.length;
  const schema = useMemo(() => houseInfoSchema(activeCount), [activeCount]);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<z.input<typeof schema>, unknown, HouseInfoValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    // `values` đồng bộ lại form khi chi tiết nhà đổi (sau khi lưu).
    values: { name: house.name, address: house.address ?? '', maxMembers: house.maxMembers },
  });

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, {
      onSuccess: () => toast('Đã lưu thông tin nhà.'),
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <ProfileSection id="house-info" overline="Nhà" title="Thông tin nhà">
      <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tên nhà" htmlFor="house-name" error={errors.name?.message}>
            <Input id="house-name" invalid={!!errors.name} {...register('name')} />
          </Field>
          <Field
            label="Số người tối đa"
            htmlFor="house-max"
            error={errors.maxMembers?.message}
            hint={`Đang có ${activeCount} người.`}
          >
            <Input
              id="house-max"
              type="number"
              inputMode="numeric"
              min={Math.max(2, activeCount)}
              max={10}
              invalid={!!errors.maxMembers}
              {...register('maxMembers', { valueAsNumber: true })}
            />
          </Field>
        </div>
        <Field label="Địa chỉ" htmlFor="house-address" error={errors.address?.message} hint="Để trống nếu không muốn hiện.">
          <Input id="house-address" leftIcon={<MapPin />} invalid={!!errors.address} {...register('address')} />
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
