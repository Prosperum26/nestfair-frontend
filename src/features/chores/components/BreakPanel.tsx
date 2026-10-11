import { zodResolver } from '@hookform/resolvers/zod';
import { Plane, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { DateInput } from '@/components/ui/DateInput.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { messageForError } from '../errors.ts';
import { useBreaks, useCreateBreak, useDeleteBreak } from '../hooks.ts';
import { type BreakFormValues, breakSchema } from '../schemas.ts';
import { dayKeyOf, fullDate } from '../week.ts';

function BreakForm({ houseId }: { houseId: string }) {
  const create = useCreateBreak(houseId);
  const [error, setError] = useState<string | null>(null);
  const today = dayKeyOf(new Date());
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BreakFormValues>({ resolver: zodResolver(breakSchema), mode: 'onTouched', defaultValues: { startDate: today, endDate: today, reason: '' } });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    create.mutate(values, {
      onSuccess: () => {
        toast('Đã đặt khoảng cả nhà vắng. Các ca trong khoảng này bị hủy và không tính là bỏ ca.');
        reset({ startDate: today, endDate: today, reason: '' });
      },
      onError: (e) => setError(messageForError(e)),
    });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      <Field label="Từ ngày" htmlFor="break-start" error={errors.startDate?.message}>
        <Controller control={control} name="startDate" render={({ field }) => <DateInput id="break-start" invalid={!!errors.startDate} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
      </Field>
      <Field label="Đến hết ngày" htmlFor="break-end" error={errors.endDate?.message}>
        <Controller control={control} name="endDate" render={({ field }) => <DateInput id="break-end" invalid={!!errors.endDate} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />} />
      </Field>
      <Field label="Lý do (không bắt buộc)" htmlFor="break-reason" error={errors.reason?.message} className="sm:col-span-2">
        <Input id="break-reason" placeholder="VD: Nghỉ Tết" autoComplete="off" invalid={!!errors.reason} {...register('reason')} />
      </Field>
      {error && (
        <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2 sm:flex sm:justify-end">
        <Button type="submit" variant="accent" loading={create.isPending}>
          Đặt khoảng nghỉ
        </Button>
      </div>
    </form>
  );
}

/** Cả nhà vắng (Tết, du lịch…): không sinh ca, ca đã có bị hủy. Chỉ trưởng phòng đặt được; ai cũng xem được. */
export function BreakPanel({ houseId, isAdmin }: { houseId: string; isAdmin: boolean }) {
  const breaks = useBreaks(houseId);
  const remove = useDeleteBreak(houseId);

  return (
    <section aria-labelledby="break-title" className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Cả nhà vắng</p>
      <h2 id="break-title" className="font-display text-ct text-ink">
        Khoảng nghỉ chung
      </h2>
      <p className="mt-1 text-sm text-ink-2">Tuần nghỉ không tính vào rào công bằng và không ai bị tính là bỏ ca.</p>

      {isAdmin && <BreakForm houseId={houseId} />}

      <div className="mt-6">
        {breaks.isPending ? (
          <Skeleton className="h-14" />
        ) : breaks.isError ? (
          <p role="alert" className="text-sm text-tom">
            {messageForError(breaks.error)}
          </p>
        ) : breaks.data.length === 0 ? (
          <EmptyState icon={<Plane />} tone="neutral" title="Chưa có khoảng nghỉ nào" className="py-6" />
        ) : (
          <ul className="divide-y divide-line">
            {breaks.data.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm font-semibold text-ink">
                    {fullDate(b.startDate)} → {fullDate(b.endDate)}
                  </p>
                  {b.reason && <p className="text-cap text-ink-2">{b.reason}</p>}
                </div>
                {isAdmin && (
                  <IconButton icon={<Trash2 />} label="Xóa khoảng nghỉ" disabled={remove.isPending} onClick={() => remove.mutate(b.id, { onError: (e) => toast(messageForError(e)) })} />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
