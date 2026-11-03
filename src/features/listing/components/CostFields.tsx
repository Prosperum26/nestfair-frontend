import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Controller, type UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { LedgerRow } from '@/components/ui/Receipt.tsx';
import { AmountInput } from '@/features/expenses/components/AmountInput.tsx';
import { formatVnd } from '@/lib/format.ts';
import { estimateTotal } from '../format.ts';
import { MAX_OTHER_FEES, type ListingFormOutput, type ListingFormValues } from '../schemas.ts';
import type { UtilitiesSummary } from '../types.ts';

/** Một dòng chi phí: nhãn + chú thích bên trái, ô nhập bên phải. */
function CostRow({ label, note, htmlFor, children }: { label: string; note?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {note && <p className="text-cap text-ink-2">{note}</p>}
      </div>
      <div className="w-40 shrink-0">{children}</div>
    </div>
  );
}

/**
 * Thẻ "Chi phí mỗi người / tháng" (ảnh 20): tiền thuê, điện nước chỉ đọc (tự tính từ Sổ chi, L3),
 * các khoản khác thêm/xóa tối đa 8, dòng ước tính cập nhật theo form (cả khi chưa lưu).
 */
export function CostFields({
  form,
  utilities,
  disabled,
}: {
  form: UseFormReturn<ListingFormValues, unknown, ListingFormOutput>;
  utilities: UtilitiesSummary | null;
  disabled: boolean;
}) {
  const { control, register, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'otherFees' });
  const rent = useWatch({ control, name: 'rentPerMonth' });
  const fees = useWatch({ control, name: 'otherFees' });
  const errors = formState.errors;
  const arrayError = errors.otherFees?.root?.message ?? errors.otherFees?.message;

  const total = estimateTotal({
    rentPerMonth: rent ?? 0,
    utilitiesPerPerson: utilities?.perPerson ?? null,
    otherFees: (fees ?? []).map((f) => ({ amount: f.amount ?? 0 })),
  });

  return (
    <section aria-labelledby="listing-cost-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="listing-cost-title" className="font-display text-ct text-ink">
          Chi phí mỗi người / tháng
        </h2>
        {!disabled && (
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus />}
            disabled={fields.length >= MAX_OTHER_FEES}
            onClick={() => append({ name: '', amount: null })}
          >
            Thêm khoản
          </Button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <div>
          <CostRow label="Tiền thuê" note="mỗi người" htmlFor="listing-rent">
            <Controller
              control={control}
              name="rentPerMonth"
              render={({ field }) => (
                <AmountInput
                  id="listing-rent"
                  size="sm"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={disabled}
                  invalid={!!errors.rentPerMonth}
                  placeholder="0"
                  aria-describedby={errors.rentPerMonth ? 'listing-rent-error' : undefined}
                />
              )}
            />
          </CostRow>
          {errors.rentPerMonth?.message && (
            <p id="listing-rent-error" role="alert" className="mt-1 text-right text-cap text-tom">
              {errors.rentPerMonth.message}
            </p>
          )}
        </div>

        <CostRow
          label="Điện nước"
          note={utilities ? `TB ${utilities.monthsUsed} tháng, tự tính từ Sổ chi` : 'Chưa có dữ liệu, chưa gồm điện nước'}
          htmlFor="listing-utilities"
        >
          <AmountInput id="listing-utilities" size="sm" value={utilities?.perPerson ?? null} onChange={() => {}} disabled placeholder="—" />
        </CostRow>

        {fields.map((field, index) => {
          const nameError = errors.otherFees?.[index]?.name?.message;
          const amountError = errors.otherFees?.[index]?.amount?.message;
          return (
            <div key={field.id}>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2 sm:grid-cols-[1fr_160px_auto]">
                <Input
                  aria-label={`Tên khoản phí ${index + 1}`}
                  placeholder="VD: Wifi"
                  autoComplete="off"
                  disabled={disabled}
                  invalid={!!nameError}
                  {...register(`otherFees.${index}.name`)}
                />
                <Button
                  variant="ghost"
                  aria-label={`Xóa khoản phí ${index + 1}`}
                  className="size-11 px-0 sm:order-3"
                  onClick={() => remove(index)}
                  disabled={disabled}
                >
                  <Trash2 />
                </Button>
                <Controller
                  control={control}
                  name={`otherFees.${index}.amount`}
                  render={({ field: amount }) => (
                    <AmountInput
                      aria-label={`Số tiền khoản phí ${index + 1}`}
                      size="sm"
                      value={amount.value}
                      onChange={amount.onChange}
                      onBlur={amount.onBlur}
                      disabled={disabled}
                      invalid={!!amountError}
                      placeholder="0"
                      className="col-span-2 sm:order-2 sm:col-span-1"
                    />
                  )}
                />
              </div>
              {(nameError || amountError) && (
                <p role="alert" className="mt-1 text-cap text-tom">
                  {nameError ?? amountError}
                </p>
              )}
            </div>
          );
        })}
        {arrayError && (
          <p role="alert" className="text-cap text-tom">
            {arrayError}
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-dashed border-line-2 pt-4">
        <LedgerRow left="Ước tính mỗi người" amount={formatVnd(total)} />
        {!utilities && <p className="mt-1.5 text-cap text-ink-2">Chưa gồm điện nước vì Sổ chi chưa có dữ liệu.</p>}
      </div>
    </section>
  );
}
