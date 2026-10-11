import { zodResolver } from '@hookform/resolvers/zod';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { useHouseDetail } from '@/features/houses/hooks.ts';
import { messageForError } from '../errors.ts';
import { useAbsences, useCreateAbsence, useDeleteAbsence } from '../hooks.ts';
import { type AbsenceFormValues, absenceSchema } from '../schemas.ts';
import { dayKeyOf, shortDate } from '../week.ts';

function AbsenceForm({ houseId, isAdmin }: { houseId: string; isAdmin: boolean }) {
  const detail = useHouseDetail(houseId);
  const create = useCreateAbsence(houseId);
  const [error, setError] = useState<string | null>(null);
  const today = dayKeyOf(new Date());
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceSchema),
    mode: 'onTouched',
    defaultValues: { userId: '', startDate: today, endDate: today, reason: '' },
  });

  const onSubmit = handleSubmit((values) => {
    setError(null);
    create.mutate(
      { startDate: values.startDate, endDate: values.endDate, reason: values.reason, userId: isAdmin && values.userId ? values.userId : undefined },
      {
        onSuccess: () => {
          toast('Đã khai vắng. Các ca còn hơn 24 giờ trong khoảng này được dời cho bạn cùng phòng.');
          reset({ userId: '', startDate: today, endDate: today, reason: '' });
        },
        onError: (e) => setError(messageForError(e)),
      },
    );
  });

  return (
    <form noValidate onSubmit={onSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
      {isAdmin && (
        <Field label="Người vắng" htmlFor="absence-user" className="sm:col-span-2" hint="Bỏ trống nếu là chính bạn.">
          <select
            id="absence-user"
            className="h-12 rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none"
            {...register('userId')}
          >
            <option value="">Chính tôi</option>
            {(detail.data?.members ?? []).map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.fullName}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Từ ngày" htmlFor="absence-start" error={errors.startDate?.message}>
        <Input id="absence-start" type="date" invalid={!!errors.startDate} {...register('startDate')} />
      </Field>
      <Field label="Đến hết ngày" htmlFor="absence-end" error={errors.endDate?.message}>
        <Input id="absence-end" type="date" invalid={!!errors.endDate} {...register('endDate')} />
      </Field>
      <Field label="Lý do (không bắt buộc)" htmlFor="absence-reason" error={errors.reason?.message} className="sm:col-span-2">
        <Input id="absence-reason" placeholder="VD: Về quê" autoComplete="off" invalid={!!errors.reason} {...register('reason')} />
      </Field>
      {error && (
        <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom sm:col-span-2">
          {error}
        </p>
      )}
      <div className="sm:col-span-2 sm:flex sm:justify-end">
        <Button type="submit" variant="accent" loading={create.isPending}>
          Khai vắng
        </Button>
      </div>
    </form>
  );
}

/** Khai vắng (S-20/S-21) và danh sách cả nhà. Xóa được khai vắng của mình; trưởng phòng xóa được mọi khai vắng. */
export function AbsencePanel({ houseId, isAdmin, meUserId }: { houseId: string; isAdmin: boolean; meUserId: string | undefined }) {
  const absences = useAbsences(houseId);
  const remove = useDeleteAbsence(houseId);

  return (
    <section aria-labelledby="absence-title" className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Vắng mặt</p>
      <h2 id="absence-title" className="font-display text-ct text-ink">
        Khai vắng
      </h2>
      <p className="mt-1 text-sm text-ink-2">Khai trước để lịch không giao việc vào những ngày bạn không có nhà.</p>

      <AbsenceForm houseId={houseId} isAdmin={isAdmin} />

      <div className="mt-6">
        {absences.isPending ? (
          <Skeleton className="h-14" />
        ) : absences.isError ? (
          <p role="alert" className="text-sm text-tom">
            {messageForError(absences.error)}
          </p>
        ) : absences.data.length === 0 ? (
          <EmptyState icon={<Trash2 />} tone="neutral" title="Chưa ai khai vắng" className="py-6" />
        ) : (
          <ul className="divide-y divide-line">
            {absences.data.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{a.userName}</p>
                  <p className="text-cap text-ink-2">
                    <span className="font-mono">
                      {shortDate(a.startDate)} → {shortDate(a.endDate)}
                    </span>
                    {a.reason ? ` · ${a.reason}` : ''}
                  </p>
                </div>
                {(isAdmin || a.userId === meUserId || a.createdById === meUserId) && (
                  <IconButton
                    icon={<Trash2 />}
                    label={`Xóa khai vắng của ${a.userName}`}
                    disabled={remove.isPending}
                    onClick={() => remove.mutate(a.id, { onError: (e) => toast(messageForError(e)) })}
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
