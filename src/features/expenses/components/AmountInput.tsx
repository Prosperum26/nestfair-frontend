import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn.ts';
import { formatVndInput, parseVndInput } from '@/lib/format.ts';

/**
 * Ô nhập tiền mono có hậu tố (ảnh 08): gõ số, tự chèn dấu chấm nghìn. Giá trị là số nguyên VNĐ hoặc null.
 * `size="lg"` cho ô "Số tiền" chính, `sm` cho ô từng người.
 */
export function AmountInput({
  value,
  onChange,
  size = 'lg',
  suffix = size === 'lg' ? 'VND' : 'đ',
  invalid,
  className,
  ...props
}: Omit<ComponentProps<'input'>, 'value' | 'onChange' | 'size'> & {
  value: number | null;
  onChange: (value: number | null) => void;
  size?: 'lg' | 'sm';
  suffix?: string;
  invalid?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-btn border bg-surface transition-shadow focus-within:border-[1.5px] focus-within:shadow-focus',
        invalid ? 'border-[1.5px] border-tom' : 'border-line-2 focus-within:border-ink',
        size === 'lg' ? 'h-16 px-4' : 'h-10 px-3',
        props.disabled && 'bg-paper-2',
        className,
      )}
    >
      <input
        inputMode="numeric"
        autoComplete="off"
        aria-invalid={invalid || undefined}
        {...props}
        value={formatVndInput(value)}
        onChange={(e) => onChange(parseVndInput(e.target.value))}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent font-mono text-ink outline-none placeholder:text-ink-3',
          size === 'lg' ? 'text-ml' : 'text-right text-ms',
        )}
      />
      <span className={cn('shrink-0 text-ink-2', size === 'lg' ? 'text-sm font-medium' : 'text-cap')}>{suffix}</span>
    </div>
  );
}
