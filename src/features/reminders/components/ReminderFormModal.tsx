import { zodResolver } from '@hookform/resolvers/zod';
import { Check, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { assistantErrorMessage } from '@/features/assistant/errors.ts';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { isoFromLocalInput } from '../format.ts';
import { useCreateReminder, useUpdateReminder } from '../hooks.ts';
import type { ReminderDto } from '../types.ts';

interface ReminderFormValues {
  title: string;
  remindAt: string;
  houseId: string;
}

/**
 * Schema form nhắc: nội dung 1–120 ký tự, thời điểm phải là ngày giờ thật và ở tương lai
 * (kiểm bằng isoFromLocalInput của FE-1 để khớp lỗi REMIND_AT_INVALID của backend).
 */
function reminderFormSchema(now: Date) {
  return z.object({
    title: z.string().trim().min(1, 'Nhập nội dung nhắc.').max(120, 'Nội dung nhắc tối đa 120 ký tự.'),
    remindAt: z
      .string()
      .min(1, 'Chọn thời gian nhắc.')
      .refine((v) => isoFromLocalInput(v, now).error !== 'invalid', 'Ngày giờ nhắc không hợp lệ.')
      .refine((v) => isoFromLocalInput(v, now).error !== 'past', 'Thời gian nhắc phải sau hiện tại.'),
    houseId: z.string().min(1, 'Chọn nhà.'),
  });
}

const selectCls =
  'h-12 w-full rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none';

/** Giờ tường VN "YYYY-MM-DDTHH:mm" của một thời điểm — giá trị cho input datetime-local (form coi giờ nhập là giờ VN). */
function vnLocalInput(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

/** Giờ tròn kế tiếp theo giờ VN làm mặc định khi tạo nhắc mới (luôn ở tương lai). */
function nextHourInput(now: Date): string {
  return vnLocalInput(new Date(Math.ceil((now.getTime() + 1) / 3_600_000) * 3_600_000));
}

function ReminderForm({ reminder, onClose }: { reminder: ReminderDto | null; onClose: () => void }) {
  const { data: houses, house } = useCurrentHouse();
  const create = useCreateReminder();
  const update = useUpdateReminder();
  const [error, setError] = useState<string | null>(null);

  const targetHouseId = reminder?.houseId ?? house?.id ?? '';
  const houseName = houses?.find((h) => h.id === targetHouseId)?.name ?? house?.name ?? 'Nhà của bạn';
  // Tạo mới mà thuộc nhiều nhà thì chọn; một nhà (hoặc đang sửa) thì cố định theo nhắc.
  const chooseHouse = !reminder && (houses?.length ?? 0) > 1;

  // Mốc "now" của schema lấy lúc mở form; lúc bấm Lưu còn kiểm lại bằng giờ hiện tại.
  const schema = useMemo(() => reminderFormSchema(new Date()), []);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      title: reminder?.title ?? '',
      remindAt: reminder ? vnLocalInput(new Date(reminder.remindAt)) : nextHourInput(new Date()),
      houseId: targetHouseId,
    },
  });

  const pending = create.isPending || update.isPending;
  const onSubmit = handleSubmit((values) => {
    setError(null);
    // Modal mở lâu thì mốc "tương lai" có thể đã trôi qua, kiểm lại trước khi gửi.
    const { iso, error: inputError } = isoFromLocalInput(values.remindAt, new Date());
    if (!iso) {
      setError(inputError === 'past' ? 'Thời gian nhắc phải sau hiện tại.' : 'Ngày giờ nhắc không hợp lệ.');
      return;
    }
    const done = () => {
      toast(reminder ? 'Đã lưu nhắc nhở.' : 'Đã tạo nhắc nhở.');
      onClose();
    };
    const fail = (e: unknown) => setError(assistantErrorMessage(e));
    if (reminder) {
      update.mutate({ id: reminder.id, body: { title: values.title, remindAt: iso } }, { onSuccess: done, onError: fail });
    } else {
      create.mutate({ houseId: values.houseId, title: values.title, remindAt: iso }, { onSuccess: done, onError: fail });
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <Field label="Nội dung" htmlFor="reminder-title" error={errors.title?.message} hint="Tối đa 120 ký tự.">
        <Input
          id="reminder-title"
          placeholder="Đổ rác, đóng tiền nhà…"
          maxLength={120}
          invalid={!!errors.title}
          {...register('title')}
        />
      </Field>

      <Field
        label="Thời gian nhắc"
        htmlFor="reminder-at"
        error={errors.remindAt?.message}
        hint="NestFair sẽ gửi thông báo đúng giờ này (giờ Việt Nam)."
      >
        <Input id="reminder-at" type="datetime-local" invalid={!!errors.remindAt} {...register('remindAt')} />
      </Field>

      {chooseHouse ? (
        <Field label="Nhà" htmlFor="reminder-house" error={errors.houseId?.message}>
          <select id="reminder-house" className={selectCls} {...register('houseId')}>
            {houses?.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <Field label="Nhà" htmlFor="reminder-house-fixed" hint="Nhắc được gắn với nhà bạn đang xem.">
          <Input id="reminder-house-fixed" value={houseName} disabled />
        </Field>
      )}

      {error && (
        <p role="alert" className="flex items-start gap-1.5 rounded-btn bg-tom-bg px-3 py-2.5 text-sm text-tom">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
        <Button variant="secondary" onClick={onClose} className="max-sm:flex-1">
          Hủy
        </Button>
        <Button type="submit" leftIcon={<Check />} loading={pending} disabled={!targetHouseId} className="max-sm:flex-1">
          {reminder ? 'Lưu nhắc' : 'Tạo nhắc'}
        </Button>
      </div>
    </form>
  );
}

/** Thêm / sửa nhắc nhở (dùng trong panel "Nhắc nhở của tôi"). */
export function ReminderFormModal({
  open,
  reminder,
  onClose,
}: {
  open: boolean;
  /** null = tạo mới. */
  reminder: ReminderDto | null;
  onClose: () => void;
}) {
  const { data: houses, house } = useCurrentHouse();
  const houseName = houses?.find((h) => h.id === (reminder?.houseId ?? house?.id))?.name ?? house?.name;
  return (
    <Modal
      open={open}
      onClose={onClose}
      overline={`${reminder ? 'Sửa nhắc nhở' : 'Nhắc nhở mới'}${houseName ? ` · ${houseName}` : ''}`}
      title={reminder ? 'Sửa nhắc nhở' : 'Thêm nhắc nhở'}
      description="NestFair sẽ gửi thông báo đúng thời điểm bạn chọn."
    >
      {/* Mount lại mỗi lần mở để form nhận đúng giá trị mặc định của nhắc đang sửa. */}
      {open && <ReminderForm key={reminder?.id ?? 'new'} reminder={reminder} onClose={onClose} />}
    </Modal>
  );
}
