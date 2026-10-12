import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { cn } from '@/lib/cn.ts';
import { defaultRotationMode, ROTATION_HINTS } from '../chore-text.ts';
import { messageForError } from '../errors.ts';
import { useCreateChore, useUpdateChore } from '../hooks.ts';
import { type ChoreFormValues, choreSchema } from '../schemas.ts';
import type { Chore, ChoreFrequency, RotationMode } from '../types.ts';

const WEIGHT_OPTIONS = ['1', '2', '3', '4', '5'].map((v) => ({ value: v, label: v }));
const FREQUENCY_OPTIONS: { value: ChoreFrequency; label: string }[] = [
  { value: 'DAILY', label: 'Hằng ngày' },
  { value: 'WEEKLY', label: 'Theo ngày' },
  { value: 'ADHOC', label: 'Đột xuất' },
];
const ROTATION_OPTIONS = (Object.keys(ROTATION_HINTS) as RotationMode[]).map((v) => ({ value: v, label: ROTATION_HINTS[v].label }));
const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const NEW_CHORE: ChoreFormValues = {
  title: '',
  weight: 2,
  frequency: 'WEEKLY',
  recurrenceDays: [],
  dueTime: '21:00',
  rotationMode: 'WEEK_BLOCK',
  occurrenceGap: 1,
};

function ChoreForm({ houseId, chore, onClose }: { houseId: string; chore: Chore | null; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  // Chế độ xoay tự theo số ngày lặp cho tới khi Admin tự chọn.
  const [rotationTouched, setRotationTouched] = useState(!!chore);
  const create = useCreateChore(houseId);
  const update = useUpdateChore(houseId);
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ChoreFormValues>({
    resolver: zodResolver(choreSchema),
    mode: 'onTouched',
    defaultValues: chore
      ? {
          title: chore.title,
          weight: chore.weight,
          frequency: chore.frequency,
          recurrenceDays: chore.recurrenceDays,
          dueTime: chore.dueTime,
          rotationMode: chore.rotationMode,
          occurrenceGap: chore.occurrenceGap,
        }
      : NEW_CHORE,
  });
  const frequency = useWatch({ control, name: 'frequency' });
  const days = useWatch({ control, name: 'recurrenceDays' });
  const mode = useWatch({ control, name: 'rotationMode' });

  const autoRotation = (f: ChoreFrequency, d: number[]) => {
    if (!rotationTouched) setValue('rotationMode', defaultRotationMode(f, d));
  };

  const pending = create.isPending || update.isPending;
  const onSubmit = handleSubmit((values) => {
    setError(null);
    const body = {
      ...values,
      recurrenceDays: values.frequency === 'WEEKLY' ? values.recurrenceDays : undefined,
      occurrenceGap: values.rotationMode === 'PER_OCCURRENCE' ? values.occurrenceGap : undefined,
    };
    const done = () => {
      toast(chore ? 'Đã lưu việc.' : `Đã thêm việc "${values.title}". Việc mới vào lịch ở lần xếp kế tiếp.`);
      onClose();
    };
    if (chore) update.mutate({ choreId: chore.id, ...body }, { onSuccess: done, onError: (e) => setError(messageForError(e)) });
    else create.mutate(body, { onSuccess: done, onError: (e) => setError(messageForError(e)) });
  });

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Tên việc" htmlFor="chore-title" error={errors.title?.message}>
        <Input id="chore-title" placeholder="VD: Đổ rác" autoComplete="off" invalid={!!errors.title} {...register('title')} />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Độ nặng</span>
        <Controller
          control={control}
          name="weight"
          render={({ field }) => (
            <SegmentedControl label="Độ nặng" options={WEIGHT_OPTIONS} value={String(field.value)} onChange={(v) => field.onChange(Number(v))} />
          )}
        />
        <p className="text-cap text-ink-2">1 là nhẹ nhất, 5 là nặng nhất. Việc nặng được chia đều giữa các bạn theo từng tuần.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Lặp lại</span>
        <Controller
          control={control}
          name="frequency"
          render={({ field }) => (
            <SegmentedControl
              label="Lặp lại"
              options={FREQUENCY_OPTIONS}
              value={field.value}
              onChange={(v) => {
                field.onChange(v);
                autoRotation(v, days);
              }}
            />
          )}
        />
        {frequency === 'ADHOC' && <p className="text-cap text-ink-2">Việc đột xuất không nằm trong lịch xoay vòng (dành cho Vòng quay).</p>}
      </div>

      {frequency === 'WEEKLY' && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Các ngày trong tuần</span>
          <div role="group" aria-label="Các ngày trong tuần" className="flex flex-wrap gap-2">
            {DAYS.map((label, i) => {
              const day = i + 1;
              const on = days.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const next = on ? days.filter((d) => d !== day) : [...days, day].sort((a, b) => a - b);
                    setValue('recurrenceDays', next, { shouldValidate: true });
                    autoRotation('WEEKLY', next);
                  }}
                  className={cn(
                    'h-10 min-w-11 rounded-btn-sm border px-3 font-mono text-sm focus-visible:outline-none focus-visible:shadow-focus',
                    on ? 'border-ink bg-hl-soft font-semibold text-ink' : 'border-line-2 bg-surface text-ink-2 hover:bg-paper',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {errors.recurrenceDays?.message && (
            <p role="alert" className="text-cap text-tom">
              {errors.recurrenceDays.message}
            </p>
          )}
        </div>
      )}

      {frequency !== 'ADHOC' && (
        <>
          <Field label="Giờ hạn (giờ nhà)" htmlFor="chore-due" error={errors.dueTime?.message}>
            <Input id="chore-due" type="time" invalid={!!errors.dueTime} {...register('dueTime')} />
          </Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Cách xoay vòng</span>
            <Controller
              control={control}
              name="rotationMode"
              render={({ field }) => (
                <SegmentedControl
                  label="Cách xoay vòng"
                  options={ROTATION_OPTIONS}
                  value={field.value}
                  onChange={(v) => {
                    setRotationTouched(true);
                    field.onChange(v);
                  }}
                />
              )}
            />
            <p className="text-cap text-ink-2">{ROTATION_HINTS[mode].hint}</p>
          </div>

          {mode === 'PER_OCCURRENCE' && (
            <Field label="Giãn cách giữa các lần" htmlFor="chore-gap" error={errors.occurrenceGap?.message} hint="Một người không làm lại trong bấy nhiêu lần kế tiếp.">
              <Input id="chore-gap" type="number" min={1} max={6} invalid={!!errors.occurrenceGap} {...register('occurrenceGap', { valueAsNumber: true })} />
            </Field>
          )}
        </>
      )}

      {error && (
        <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Để sau
        </Button>
        <Button type="submit" variant="accent" loading={pending}>
          {chore ? 'Lưu việc' : 'Thêm việc'}
        </Button>
      </div>
    </form>
  );
}

/** Thêm hoặc sửa việc (trưởng phòng). */
export function ChoreFormModal({ open, onClose, houseId, chore }: { open: boolean; onClose: () => void; houseId: string; chore: Chore | null }) {
  return (
    <Modal open={open} onClose={onClose} title={chore ? 'Sửa việc' : 'Việc mới'} description="Đặt tên, độ nặng, ngày lặp và giờ hạn. Thay đổi áp dụng từ lần xếp lịch kế tiếp.">
      {open && <ChoreForm key={chore?.id ?? 'new'} houseId={houseId} chore={chore} onClose={onClose} />}
    </Modal>
  );
}
