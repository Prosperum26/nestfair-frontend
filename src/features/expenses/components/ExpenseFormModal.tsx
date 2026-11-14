import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check, CircleCheck, LoaderCircle, TriangleAlert, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Checkbox } from '@/components/ui/Checkbox.tsx';
import { DateInput } from '@/components/ui/DateInput.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { expensesApi } from '../api.ts';
import { CATEGORY_META, SELECTABLE_CATEGORIES } from '../category.ts';
import { ledgerErrorMessage } from '../errors.ts';
import { localDateOf } from '../grouping.ts';
import { useCreateExpense, useUpdateExpense } from '../hooks.ts';
import { IMAGE_ACCEPT, prepareImage } from '../image-upload.ts';
import { withPrefillExtras } from '../prefill.ts';
import { expenseFormSchema } from '../schemas.ts';
import { type ExpenseFormValues, type FormSplitType, previewSplit, toExpenseInput } from '../split-preview.ts';
import type { Expense, ExpenseCategory, UserBrief } from '../types.ts';
import { AmountInput } from './AmountInput.tsx';
import { Person } from './bits.tsx';

const SPLIT_OPTIONS: { value: FormSplitType; label: string }[] = [
  { value: 'EQUAL', label: 'Chia đều' },
  { value: 'CUSTOM', label: 'Chọn người' },
  { value: 'EXACT', label: 'Chính xác' },
];

const selectCls =
  'h-12 w-full rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none';

/** Giá trị điền sẵn cho khoản chi MỚI (từ quét hóa đơn). `receiptScanId` gắn bản nháp OCR vào khoản chi khi lưu. */
export interface ExpensePrefill {
  title?: string;
  /** YYYY-MM-DD */
  date?: string;
  totalAmount?: number | null;
  category?: ExpenseCategory;
  receiptImageUrl?: string | null;
  receiptScanId?: string;
  /** Món của hóa đơn quét (tên + tiền), lưu kèm khoản chi để xem lại. */
  items?: { name: string; lineTotal: number }[];
}

interface FormProps {
  houseId: string;
  houseName: string;
  /** Thành viên theo thứ tự vào nhà (quyết định ai nhận 1đ dư). */
  members: UserBrief[];
  meId: string | undefined;
  expense: Expense | null;
  /** Chỉ dùng khi `expense` là null (thêm mới). */
  prefill?: ExpensePrefill;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}

function defaultsFor(expense: Expense | null, memberIds: string[], meId: string | undefined, prefill?: ExpensePrefill): ExpenseFormValues {
  if (!expense) {
    return {
      title: prefill?.title ?? '',
      date: prefill?.date ?? localDateOf(new Date()),
      totalAmount: prefill?.totalAmount ?? null,
      payerId: meId && memberIds.includes(meId) ? meId : (memberIds[0] ?? ''),
      category: prefill?.category ?? 'FOOD',
      splitType: 'EQUAL',
      participants: memberIds,
      exact: {},
      note: '',
      receiptImageUrl: prefill?.receiptImageUrl ?? null,
    };
  }
  const splitType: FormSplitType = expense.splitType === 'ITEMIZED' ? 'EXACT' : expense.splitType;
  return {
    title: expense.title,
    date: localDateOf(expense.spentAt),
    totalAmount: expense.totalAmount,
    payerId: expense.payer.id,
    category: expense.category,
    splitType,
    participants: splitType === 'EQUAL' ? memberIds : expense.splits.map((s) => s.userId),
    exact: Object.fromEntries(expense.splits.map((s) => [s.userId, s.amount])),
    note: expense.note ?? '',
    receiptImageUrl: expense.receiptImageUrl,
  };
}

function ExpenseForm({ houseId, members, meId, expense, prefill, onClose, onSaved }: FormProps) {
  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const today = localDateOf(new Date());
  const schema = useMemo(() => expenseFormSchema(memberIds, today), [memberIds, today]);
  const create = useCreateExpense(houseId);
  const update = useUpdateExpense(houseId);
  const [error, setError] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ busy: boolean; name: string | null }>({ busy: false, name: null });
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: defaultsFor(expense, memberIds, meId, prefill),
  });
  const [total, splitType, participants, exact, receiptImageUrl] = useWatch({
    control,
    name: ['totalAmount', 'splitType', 'participants', 'exact', 'receiptImageUrl'],
  });
  const preview = previewSplit({ splitType, total, memberIds, participants, exact });
  const shareOf = (id: string) => preview.shares.find((s) => s.userId === id)?.amount;

  const changeSplitType = (next: FormSplitType) => {
    // Sang "Chính xác" mà chưa nhập gì: điền sẵn phần chia đều để tổng khớp ngay, người dùng chỉ việc sửa.
    if (next === 'EXACT') {
      const current = getValues('exact');
      if (Object.values(current).every((v) => !v)) {
        const equal = previewSplit({ splitType: 'CUSTOM', total, memberIds, participants, exact: {} });
        setValue('exact', Object.fromEntries(equal.shares.map((s) => [s.userId, s.amount])));
      }
    }
    setValue('splitType', next, { shouldValidate: false });
  };

  const toggle = (id: string, on: boolean) => {
    const next = on ? [...participants, id] : participants.filter((p) => p !== id);
    setValue('participants', next, { shouldValidate: !!errors.participants });
  };

  const pickImage = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUpload({ busy: true, name: file.name });
    try {
      const photo = await prepareImage(file);
      const { url } = await expensesApi.uploadReceipt(houseId, photo, file.name);
      setValue('receiptImageUrl', url);
      setUpload({ busy: false, name: file.name });
    } catch (e) {
      setUpload({ busy: false, name: null });
      setError(ledgerErrorMessage(e));
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const pending = create.isPending || update.isPending;
  const onSubmit = handleSubmit((values) => {
    setError(null);
    const body = toExpenseInput({ ...values, totalAmount: values.totalAmount! });
    const done = (saved: Expense) => {
      toast(expense ? 'Đã lưu khoản chi.' : `Đã ghi "${saved.title}" · ${formatVnd(saved.totalAmount)}.`);
      onSaved(saved);
      onClose();
    };
    const fail = (e: unknown) => setError(ledgerErrorMessage(e));
    if (expense) update.mutate({ id: expense.id, body }, { onSuccess: done, onError: fail });
    else create.mutate(withPrefillExtras(body, prefill), { onSuccess: done, onError: fail });
  });

  const exactBlocked = splitType === 'EXACT' && !preview.ok;
  const progress = total ? Math.min(100, (preview.assigned / total) * 100) : 0;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-[1fr_168px]">
        <Field label="Khoản chi" htmlFor="expense-title" error={errors.title?.message}>
          <Input id="expense-title" placeholder="Pizza tối thứ Bảy" maxLength={80} invalid={!!errors.title} {...register('title')} />
        </Field>
        <Field label="Ngày" htmlFor="expense-date" error={errors.date?.message}>
          <Controller
            control={control}
            name="date"
            render={({ field }) => <DateInput id="expense-date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.date} />}
          />
        </Field>
      </div>

      <Field label="Số tiền" htmlFor="expense-amount" error={errors.totalAmount?.message}>
        <Controller
          control={control}
          name="totalAmount"
          render={({ field }) => (
            <AmountInput id="expense-amount" placeholder="0" value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.totalAmount} />
          )}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Người trả" htmlFor="expense-payer" error={errors.payerId?.message}>
          <select id="expense-payer" className={selectCls} {...register('payerId')}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {firstName(m.fullName)}
                {m.id === meId ? ' (bạn)' : ''}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Danh mục" htmlFor="expense-category">
          <select id="expense-category" className={selectCls} {...register('category')}>
            {(expense?.category === 'GIFT' ? [...SELECTABLE_CATEGORIES, 'GIFT' as const] : SELECTABLE_CATEGORIES).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_META[c].label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium text-ink">Cách chia</span>
        <SegmentedControl label="Cách chia" options={SPLIT_OPTIONS} value={splitType} onChange={changeSplitType} />
        <ul className="flex flex-col gap-1" aria-label="Phần của từng người">
          {members.map((m) => {
            const checked = splitType === 'EQUAL' || participants.includes(m.id);
            const name = <Person user={m} meId={undefined} className="text-sm font-medium text-ink" />;
            const label = m.id === meId ? <span className="flex items-center gap-1">{name}<span className="text-ink-2">(bạn)</span></span> : name;
            return (
              <li key={m.id} className="flex min-h-11 items-center gap-3">
                <div className="min-w-0 flex-1">
                  {splitType === 'EQUAL' ? label : <Checkbox id={`share-${m.id}`} label={label} checked={checked} onChange={(e) => toggle(m.id, e.target.checked)} />}
                </div>
                {splitType === 'EXACT' ? (
                  <AmountInput
                    size="sm"
                    aria-label={`Phần của ${m.fullName}`}
                    className="w-[140px]"
                    placeholder="0"
                    disabled={!checked}
                    value={checked ? (exact[m.id] ?? null) : null}
                    onChange={(v) => setValue('exact', { ...getValues('exact'), [m.id]: v })}
                  />
                ) : (
                  <span className={cn('font-mono text-ms', checked ? 'text-ink' : 'text-ink-3')}>{checked ? formatVnd(shareOf(m.id) ?? 0) : '–'}</span>
                )}
              </li>
            );
          })}
        </ul>
        {errors.participants?.message && (
          <p role="alert" className="flex items-center gap-1.5 text-cap text-tom">
            <TriangleAlert className="size-3.5" aria-hidden />
            {errors.participants.message}
          </p>
        )}

        {splitType === 'EXACT' && !!total && (
          <div className={cn('rounded-btn border px-4 py-3', preview.diff === 0 ? 'border-mint-bg bg-mint-bg' : 'border-tom-border bg-tom-bg')} role="status">
            {preview.diff === 0 ? (
              <p className="flex items-center gap-2 text-sm font-semibold text-mint">
                <CircleCheck className="size-4" aria-hidden />
                Đã khớp tổng <span className="ml-auto font-mono">{formatVnd(total)}</span>
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 text-sm font-semibold text-tom">
                  <TriangleAlert className="size-4" aria-hidden />
                  {preview.diff > 0 ? `Còn thiếu ${formatVnd(preview.diff)}` : `Thừa ${formatVnd(-preview.diff)}`}
                  <span className="ml-auto font-mono text-cap">
                    {formatVnd(preview.assigned).replace('đ', '')} / {formatVnd(total)}
                  </span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden>
                  <div className="h-full rounded-full bg-tom-v" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-cap text-tom">Tổng các phần phải bằng số tiền hóa đơn thì mới lưu được.</p>
              </>
            )}
          </div>
        )}
      </div>

      <Field label="Ghi chú" htmlFor="expense-note" error={errors.note?.message}>
        <Input id="expense-note" placeholder="Không bắt buộc" maxLength={200} {...register('note')} />
      </Field>

      {error && (
        <p role="alert" className="flex items-start gap-1.5 rounded-btn bg-tom-bg px-3 py-2.5 text-sm text-tom">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <input ref={fileRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={(e) => void pickImage(e.target.files?.[0])} />
        {receiptImageUrl || upload.busy ? (
          <span className="inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-line-2 bg-surface pr-1 pl-3 text-sm text-ink">
            {upload.busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : <Camera className="size-4 text-ink-2" aria-hidden />}
            <span className="truncate">{upload.busy ? 'Đang tải ảnh…' : (upload.name ?? 'Ảnh hóa đơn')}</span>
            {!upload.busy && (
              <button
                type="button"
                aria-label="Bỏ ảnh hóa đơn"
                onClick={() => {
                  setValue('receiptImageUrl', null);
                  setUpload({ busy: false, name: null });
                }}
                className="flex size-7 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </span>
        ) : (
          <Button variant="ghost" leftIcon={<Camera />} onClick={() => fileRef.current?.click()}>
            Thêm ảnh hóa đơn
          </Button>
        )}
        <div className="ml-auto flex gap-3 max-sm:w-full">
          <Button variant="secondary" onClick={onClose} className="max-sm:flex-1">
            Hủy
          </Button>
          <Button type="submit" leftIcon={<Check />} loading={pending} disabled={exactBlocked || upload.busy} className="max-sm:flex-1">
            Lưu khoản chi
          </Button>
        </div>
      </div>
    </form>
  );
}

/** Thêm / sửa khoản chi (ảnh 08): modal desktop, bottom sheet mobile. */
export function ExpenseFormModal({ open, ...props }: FormProps & { open: boolean }) {
  return (
    <Modal
      open={open}
      onClose={props.onClose}
      overline={`${props.expense ? 'Sửa khoản chi' : 'Chi tiêu mới'} · ${props.houseName}`}
      title={props.expense ? 'Sửa khoản chi' : 'Thêm khoản chi'}
    >
      {/* Mount lại mỗi lần mở để form lấy đúng giá trị mặc định; chờ có danh sách thành viên (mở từ FAB lúc trang vừa tải). */}
      {open &&
        (props.members.length > 0 ? (
          <ExpenseForm key={props.expense?.id ?? 'new'} {...props} />
        ) : (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải thành viên">
            <Skeleton className="h-12" />
            <Skeleton className="h-16" />
            <Skeleton className="h-40" />
          </div>
        ))}
    </Modal>
  );
}
