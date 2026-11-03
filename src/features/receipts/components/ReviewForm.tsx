import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check, CircleCheck, Info, Plus, TriangleAlert, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { DateInput } from '@/components/ui/DateInput.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { CATEGORY_META, SELECTABLE_CATEGORIES } from '@/features/expenses/category.ts';
import { AmountInput } from '@/features/expenses/components/AmountInput.tsx';
import type { ExpensePrefill } from '@/features/expenses/components/ExpenseFormModal.tsx';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { localDateOf } from '@/features/expenses/grouping.ts';
import { useCreateExpense } from '@/features/expenses/hooks.ts';
import type { Expense, UserBrief } from '@/features/expenses/types.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatSignedVnd, formatVnd } from '@/lib/format.ts';
import { draftToReviewValues, receiptFlags, receiptReviewSchema, type ReviewFormValues, type ReviewItem, toItemizedInput } from '../draft-form.ts';
import { previewItemized } from '../itemized.ts';
import type { ReceiptDraft } from '../types.ts';
import { ItemRow } from './ItemRow.tsx';
import { PerPersonSummary } from './PerPersonSummary.tsx';
import { ReceiptImagePanel } from './ReceiptImagePanel.tsx';

const selectCls =
  'h-12 w-full rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none';

/** Viền vàng (vòng đặc 2px, không bóng mờ) quanh ô mà AI không chắc, cho tới khi người dùng sửa ô đó. */
const flaggedCls = 'rounded-btn ring-2 ring-hl';

const newItem = (memberIds: string[]): ReviewItem => ({ name: '', quantity: 1, lineTotal: null, userIds: [...memberIds], uncertain: false, note: null });

interface Props {
  houseId: string;
  /** Thành viên theo thứ tự vào nhà (quyết định ai nhận 1đ dư). */
  members: UserBrief[];
  meId: string | undefined;
  draft: ReceiptDraft;
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
  /** Ảnh đã tải lên (gắn vào khoản chi). */
  imageUrl: string;
  /** null khi bản nháp không đi qua backend (engine OCR cục bộ, phase 2). */
  scanId: string | null;
  onRescan: () => void;
  onSaved: (expense: Expense) => void;
  /** "Chia kiểu khác": mở form chi tiêu thường với các giá trị hiện tại (D9). */
  onOtherSplit: (prefill: ExpensePrefill) => void;
}

/**
 * Màn xác nhận hóa đơn (Design.md ảnh 18): ảnh bên trái, dữ liệu AI điền sẵn bên phải để kiểm tra, sửa và gán món
 * cho người dùng. Chỉ khi bấm Lưu mới có khoản chi `ITEMIZED` (AI không tự ghi).
 */
export function ReviewForm({ houseId, members, meId, draft, previewUrl, fileName, sizeBytes, imageUrl, scanId, onRescan, onSaved, onOtherSplit }: Props) {
  const memberIds = useMemo(() => members.map((m) => m.id), [members]);
  const today = useMemo(() => localDateOf(new Date()), []);
  const schema = useMemo(() => receiptReviewSchema(memberIds, today), [memberIds, today]);
  const flags = useMemo(() => receiptFlags(draft), [draft]);
  const create = useCreateExpense(houseId);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: draftToReviewValues(draft, { memberIds, meId, today }),
  });
  const values = useWatch({ control }) as ReviewFormValues;
  const items = values.items ?? [];
  const preview = previewItemized({ total: values.totalAmount ?? null, items, memberIds });
  const parsed = schema.safeParse(values);
  const blocker = parsed.success ? null : (parsed.error.issues[0]?.message ?? null);

  const setItems = (next: ReviewItem[]) => setValue('items', next, { shouldDirty: true, shouldValidate: true });
  const flaggedItems = items.filter((i) => i.uncertain).length;
  const anyFlag = flaggedItems > 0 || (flags.total && !dirtyFields.totalAmount) || (flags.date && !dirtyFields.date);
  const rootItemsError = errors.items?.message ?? errors.items?.root?.message;

  const onSubmit = handleSubmit((v) => {
    setError(null);
    const body = toItemizedInput({ ...v, totalAmount: v.totalAmount!, items: v.items.map((i) => ({ ...i, lineTotal: i.lineTotal! })) }, { scanId, imageUrl });
    create.mutate(body, {
      onSuccess: (saved) => {
        toast(`Đã ghi "${saved.title}" · ${formatVnd(saved.totalAmount)}.`);
        onSaved(saved);
      },
      onError: (e) => setError(ledgerErrorMessage(e)),
    });
  });

  const categoryMeta = CATEGORY_META[values.category ?? 'FOOD'];
  const CategoryIcon = categoryMeta.icon;

  const saveButton = (className?: string) => (
    <Button type="submit" leftIcon={<Check />} loading={create.isPending} disabled={!parsed.success} className={className}>
      Lưu khoản chi
    </Button>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-over uppercase text-ink-2">Bản nháp từ ảnh · Gemini Vision</p>
          <h1 className="mt-2 font-display text-h1m text-ink lg:text-h1">
            Xác nhận{' '}
            <span className="relative isolate px-0.5 before:absolute before:inset-x-0 before:bottom-[0.1em] before:-z-10 before:h-[0.4em] before:bg-hl before:content-['']">hóa đơn</span>
          </h1>
          <p className="mt-2 text-sm text-ink-2">AI chỉ điền sẵn. Khoản chi chỉ vào sổ khi bạn bấm Lưu.</p>
        </div>
        <div className="flex shrink-0 gap-3 max-lg:hidden">
          <Button variant="secondary" leftIcon={<Camera />} onClick={onRescan}>
            Chụp lại
          </Button>
          {saveButton()}
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
        <ReceiptImagePanel previewUrl={previewUrl} fileName={fileName} sizeBytes={sizeBytes} className="lg:sticky lg:top-6">
          {anyFlag && (
            <p className="flex items-start gap-2 rounded-btn bg-hl-soft px-3.5 py-2.5 text-cap text-hl-ink">
              <TriangleAlert className="mt-px size-4 shrink-0" aria-hidden />
              Ô tô vàng là chỗ AI không chắc: chữ mờ, viết tay hoặc mất góc. Kiểm tra rồi bấm Lưu.
            </p>
          )}
        </ReceiptImagePanel>

        <div className="flex flex-col gap-6">
          {draft.warnings.length > 0 && (
            <ul className="flex flex-col gap-2" aria-label="Cảnh báo từ AI">
              {draft.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 rounded-btn bg-hl-soft px-3.5 py-2.5 text-sm text-hl-ink">
                  <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {w.message}
                </li>
              ))}
            </ul>
          )}

          <section className="rounded-card border border-line bg-surface p-6 max-sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-ct text-ink">Thông tin chung</h2>
              <Chip tone={categoryMeta.tone} icon={<CategoryIcon />}>
                {categoryMeta.label}
              </Chip>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                <Field label="Cửa hàng" htmlFor="rv-title" error={errors.title?.message}>
                  <Input id="rv-title" maxLength={80} invalid={!!errors.title} {...register('title')} />
                </Field>
                <Field label="Ngày mua" htmlFor="rv-date" error={errors.date?.message}>
                  <div className={cn(flags.date && !dirtyFields.date && flaggedCls)}>
                    <Controller
                      control={control}
                      name="date"
                      render={({ field }) => <DateInput id="rv-date" value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.date} />}
                    />
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
                <Field label="Tổng thực trả" htmlFor="rv-total" error={errors.totalAmount?.message} hint="Chỉ lấy tổng thực trả, không tách thuế.">
                  <div className={cn(flags.total && !dirtyFields.totalAmount && flaggedCls)}>
                    <Controller
                      control={control}
                      name="totalAmount"
                      render={({ field }) => (
                        <AmountInput id="rv-total" placeholder="0" value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.totalAmount} />
                      )}
                    />
                  </div>
                </Field>
                <Field label="Người trả" htmlFor="rv-payer" error={errors.payerId?.message}>
                  <select id="rv-payer" className={selectCls} {...register('payerId')}>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {firstName(m.fullName)}
                        {m.id === meId ? ' (bạn)' : ''}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2">
                <Field label="Danh mục" htmlFor="rv-category">
                  <select id="rv-category" className={selectCls} {...register('category')}>
                    {SELECTABLE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_META[c].label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ghi chú" htmlFor="rv-note" error={errors.note?.message}>
                  <Input id="rv-note" placeholder="Không bắt buộc" maxLength={200} {...register('note')} />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-card border border-line bg-surface p-6 max-sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-over uppercase text-ink-2">Chia theo từng món</p>
                <h2 className="mt-1 font-display text-ct text-ink">Các món trên hóa đơn</h2>
              </div>
              <Chip tone="outline">{items.length} món</Chip>
            </div>

            <ul className="mt-4 flex flex-col gap-1" aria-label="Các món trên hóa đơn">
              {items.map((item, i) => (
                <ItemRow
                  key={i}
                  item={item}
                  members={members}
                  flagged={item.uncertain}
                  error={{
                    name: errors.items?.[i]?.name?.message,
                    lineTotal: errors.items?.[i]?.lineTotal?.message,
                    userIds: errors.items?.[i]?.userIds?.message,
                  }}
                  onChange={(next) => setItems(items.map((x, j) => (j === i ? next : x)))}
                  onRemove={() => setItems(items.filter((_, j) => j !== i))}
                />
              ))}
            </ul>
            {rootItemsError && (
              <p role="alert" className="mt-2 flex items-center gap-1.5 text-cap text-tom">
                <TriangleAlert className="size-3.5" aria-hidden />
                {rootItemsError}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" leftIcon={<Plus />} onClick={() => setItems([...items, newItem(memberIds)])}>
                Thêm món
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Users />}
                onClick={() => {
                  const v = getValues();
                  onOtherSplit({ title: v.title, date: v.date, totalAmount: v.totalAmount, category: v.category, receiptImageUrl: imageUrl, receiptScanId: scanId ?? undefined });
                }}
              >
                Chia kiểu khác
              </Button>
            </div>

            <div className="mt-4" role="status" aria-live="polite">
              {preview.ok && preview.diff === 0 && (
                <p className="flex items-center gap-2 rounded-btn bg-mint-bg px-4 py-3 text-sm font-semibold text-mint">
                  <CircleCheck className="size-4 shrink-0" aria-hidden />
                  Tổng các món khớp tổng hóa đơn
                  <span className="ml-auto font-mono">{formatVnd(values.totalAmount ?? 0)}</span>
                </p>
              )}
              {preview.ok && preview.diff !== 0 && (
                <p className="rounded-btn bg-sky-bg px-4 py-3 text-cap text-sky">
                  Tổng các món {formatVnd(preview.itemsSum)} lệch tổng hóa đơn {formatVnd(values.totalAmount ?? 0)} ({formatSignedVnd(preview.diff)}). Phần chênh (giảm giá, phí) được chia theo tỷ lệ tiền món của từng người.
                </p>
              )}
              {!preview.ok && preview.unassigned.length > 0 && (
                <p className="flex items-center gap-2 rounded-btn bg-tom-bg px-4 py-3 text-sm font-semibold text-tom">
                  <TriangleAlert className="size-4 shrink-0" aria-hidden />
                  Còn {preview.unassigned.length} món chưa chọn người dùng.
                </p>
              )}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <PerPersonSummary members={members} shares={preview.shares} meId={meId} payerId={values.payerId ?? ''} provisional={!preview.ok} />
            </div>
          </section>

          {error && (
            <p role="alert" className="flex items-start gap-1.5 rounded-btn bg-tom-bg px-3 py-2.5 text-sm text-tom">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {error}
            </p>
          )}

          <div className="flex flex-col gap-3 lg:hidden">
            {blocker && <p className="text-cap text-ink-2">{blocker}</p>}
            {saveButton('w-full')}
            <Button variant="ghost" leftIcon={<Camera />} onClick={onRescan} fullWidth>
              Chụp lại
            </Button>
          </div>
          {blocker && <p className="text-right text-cap text-ink-2 max-lg:hidden">{blocker}</p>}
        </div>
      </div>
    </form>
  );
}
