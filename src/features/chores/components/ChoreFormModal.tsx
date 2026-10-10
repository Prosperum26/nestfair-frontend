import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { useCreateChore } from '../hooks.ts';
import { type ChoreFormValues, choreSchema } from '../schemas.ts';

const WEIGHT_OPTIONS = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }));
const DEFAULTS: ChoreFormValues = { title: '', weight: 2 };

/** Thêm việc mới (trưởng phòng). Độ nặng 1–5 để thuật toán chia đều tải giữa các thành viên. */
export function ChoreFormModal({
  open,
  onClose,
  houseId,
}: {
  open: boolean;
  onClose: () => void;
  houseId: string;
}) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChoreFormValues>({
    resolver: zodResolver(choreSchema),
    mode: 'onTouched',
    defaultValues: DEFAULTS,
  });
  const createChore = useCreateChore(houseId);

  // Mở lại modal luôn là form trống.
  useEffect(() => {
    if (open) reset(DEFAULTS);
  }, [open, reset]);

  const onSubmit = handleSubmit((values) =>
    createChore.mutate(values, {
      onSuccess: () => {
        toast(`Đã thêm việc "${values.title}". Việc mới sẽ vào lịch ở lần xếp tới.`);
        onClose();
      },
      onError: (error) => toast(error.message),
    }),
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Việc mới"
      description="Đặt tên và độ nặng. Việc nặng được chia đều giữa các bạn theo từng tuần."
    >
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <Field label="Tên việc" htmlFor="chore-title" error={errors.title?.message}>
          <Input
            id="chore-title"
            placeholder="VD: Đổ rác"
            autoComplete="off"
            invalid={!!errors.title}
            {...register('title')}
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Độ nặng</span>
          <Controller
            control={control}
            name="weight"
            render={({ field }) => (
              <SegmentedControl
                label="Độ nặng"
                options={WEIGHT_OPTIONS}
                value={String(field.value)}
                onChange={(v) => field.onChange(Number(v))}
              />
            )}
          />
          <p className="text-cap text-ink-2">1 là nhẹ nhất, 5 là nặng nhất.</p>
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Để sau
          </Button>
          <Button type="submit" variant="accent" loading={createChore.isPending}>
            Thêm việc
          </Button>
        </div>
      </form>
    </Modal>
  );
}
