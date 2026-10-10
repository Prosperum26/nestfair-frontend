import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, House, Minus, Plus } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { useCreateHouse } from '../hooks.ts';
import {
  type CreateHouseFormInput,
  type CreateHouseFormValues,
  createHouseSchema,
} from '../schemas.ts';
import type { HouseDetail } from '../types.ts';

type SizeOption = '2' | '3' | '4' | '5' | '6+';
const SIZE_OPTIONS = (['2', '3', '4', '5', '6+'] as const).map((v) => ({ value: v, label: v }));
const MAX = 10;

/** "6+" mở thêm bộ đếm 6–10 (backend giới hạn 10 người). */
function MemberCountField({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const option: SizeOption = value >= 6 ? '6+' : (String(value) as SizeOption);
  return (
    <div className="flex flex-col gap-2">
      <SegmentedControl
        label="Số người dự kiến"
        options={SIZE_OPTIONS}
        value={option}
        onChange={(v) => onChange(v === '6+' ? 6 : Number(v))}
      />
      {value >= 6 && (
        <div className="flex items-center justify-between rounded-btn border border-line-2 bg-surface px-2 py-1.5">
          <button
            type="button"
            aria-label="Bớt một người"
            disabled={value <= 6}
            onClick={() => onChange(value - 1)}
            className="flex size-8 items-center justify-center rounded-btn-sm hover:bg-paper-2 disabled:opacity-[0.38] [&_svg]:size-4"
          >
            <Minus />
          </button>
          <span className="font-mono text-ms text-ink" aria-live="polite">
            {value} người
          </span>
          <button
            type="button"
            aria-label="Thêm một người"
            disabled={value >= MAX}
            onClick={() => onChange(value + 1)}
            className="flex size-8 items-center justify-center rounded-btn-sm hover:bg-paper-2 disabled:opacity-[0.38] [&_svg]:size-4"
          >
            <Plus />
          </button>
        </div>
      )}
    </div>
  );
}

export function CreateHouseCard({ onCreated }: { onCreated: (house: HouseDetail) => void }) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateHouseFormInput, unknown, CreateHouseFormValues>({
    resolver: zodResolver(createHouseSchema),
    mode: 'onTouched',
    defaultValues: { name: '', address: '', maxMembers: 4 },
  });
  const createHouse = useCreateHouse();

  const onSubmit = handleSubmit((values) =>
    createHouse.mutate(values, {
      onSuccess: onCreated,
      onError: (error) => toast(error.message),
    }),
  );

  return (
    <section
      aria-labelledby="create-house-title"
      className="flex h-full flex-col rounded-card border border-line bg-surface p-5 sm:p-7"
    >
      <IconTile icon={<House />} tone="hl" size={48} />
      <h2 id="create-house-title" className="mt-5 font-display text-h1m text-ink">
        Tạo nhà mới
      </h2>
      <p className="mt-2 text-sm text-ink-2">
        Bạn sẽ là trưởng phòng: cấu hình việc nhà, quy tắc chia tiền và mời thành viên.
      </p>

      <form className="mt-6 flex flex-1 flex-col" noValidate onSubmit={onSubmit}>
        <div className="flex flex-col gap-5">
          <Field label="Tên nhà" htmlFor="house-name" error={errors.name?.message}>
            <Input
              id="house-name"
              placeholder="VD: Nhà 12A"
              autoComplete="off"
              invalid={!!errors.name}
              {...register('name')}
            />
          </Field>
          <Field
            label="Địa chỉ ngắn (không bắt buộc)"
            htmlFor="house-address"
            error={errors.address?.message}
          >
            <Input
              id="house-address"
              placeholder="VD: Hẻm 51, Linh Trung, Thủ Đức"
              autoComplete="off"
              invalid={!!errors.address}
              {...register('address')}
            />
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink" id="house-size-label">
              Số người dự kiến
            </span>
            <Controller
              control={control}
              name="maxMembers"
              render={({ field }) => (
                <MemberCountField value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          fullWidth
          className="mt-8 lg:mt-auto"
          loading={createHouse.isPending}
        >
          Tạo nhà và lấy mã mời
          <ArrowRight aria-hidden />
        </Button>
      </form>
    </section>
  );
}
