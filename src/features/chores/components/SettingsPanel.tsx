import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { messageForError } from '../errors.ts';
import { useChoreSettings, useUpdateSettings } from '../hooks.ts';
import { type SettingsFormValues, settingsSchema } from '../schemas.ts';

function SettingsForm({ houseId, initial, isAdmin }: { houseId: string; initial: SettingsFormValues; isAdmin: boolean }) {
  const update = useUpdateSettings(houseId);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({ resolver: zodResolver(settingsSchema), mode: 'onTouched', defaultValues: initial });

  const onSubmit = handleSubmit((values) =>
    update.mutate(values, { onSuccess: () => toast('Đã lưu cài đặt.'), onError: (e) => toast(messageForError(e)) }),
  );

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-5 sm:grid-cols-2">
      <Field label="Ân hạn nộp muộn (giờ)" htmlFor="grace" error={errors.choreGraceHours?.message} hint="Quá hạn nhưng còn trong ân hạn vẫn nộp được, ca được gắn nhãn Nộp muộn.">
        <Input id="grace" type="number" min={1} max={24} disabled={!isAdmin} invalid={!!errors.choreGraceHours} {...register('choreGraceHours', { valueAsNumber: true })} />
      </Field>
      <Field label="Số ca tối đa mỗi người mỗi ngày" htmlFor="max-slots" error={errors.maxSlotsPerPersonPerDay?.message} hint="Thuật toán cố giữ giới hạn này khi còn người khác nhận được.">
        <Input id="max-slots" type="number" min={1} max={6} disabled={!isAdmin} invalid={!!errors.maxSlotsPerPersonPerDay} {...register('maxSlotsPerPersonPerDay', { valueAsNumber: true })} />
      </Field>
      {isAdmin ? (
        <div className="sm:col-span-2 sm:flex sm:justify-end">
          <Button type="submit" loading={update.isPending} disabled={!isDirty}>
            Lưu cài đặt
          </Button>
        </div>
      ) : (
        <p className="text-cap text-ink-2 sm:col-span-2">Chỉ trưởng phòng chỉnh được các giá trị này.</p>
      )}
    </form>
  );
}

/** Ân hạn nộp muộn và số ca tối đa / người / ngày. */
export function SettingsPanel({ houseId, isAdmin }: { houseId: string; isAdmin: boolean }) {
  const settings = useChoreSettings(houseId);
  return (
    <section aria-labelledby="settings-title" className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Quy tắc</p>
      <h2 id="settings-title" className="font-display text-ct text-ink">
        Ân hạn và số ca mỗi ngày
      </h2>
      {settings.isPending ? (
        <Skeleton className="mt-4 h-24" />
      ) : settings.isError ? (
        <p role="alert" className="mt-4 text-sm text-tom">
          {messageForError(settings.error)}
        </p>
      ) : (
        <SettingsForm houseId={houseId} initial={settings.data} isAdmin={isAdmin} />
      )}
    </section>
  );
}
