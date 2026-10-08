import { Check } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type'> {
  label: ReactNode;
  invalid?: boolean;
}

/** Ô 20 r6: chọn = nền ink + dấu tick hl; chưa chọn = viền 1.5 line-2. */
export function Checkbox({ label, invalid, className, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn('flex cursor-pointer items-start gap-2.5', className)}>
      <span className="relative mt-px flex size-5 shrink-0">
        <input
          id={id}
          type="checkbox"
          aria-invalid={invalid || undefined}
          className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-line-2 bg-surface checked:border-ink checked:bg-ink focus-visible:shadow-focus focus-visible:outline-none aria-invalid:border-tom"
          {...props}
        />
        <Check
          className="pointer-events-none relative m-auto hidden size-3.5 text-hl peer-checked:block"
          strokeWidth={3}
          aria-hidden
        />
      </span>
      <span className="text-sm text-ink">{label}</span>
    </label>
  );
}
