import { cn } from '@/lib/cn.ts';

interface Option<T extends string> {
  value: T;
  label: string;
}

/** Thanh chọn một trong nhiều (nền paper-2, mục chọn nền surface). Dùng role radiogroup. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('flex rounded-btn bg-paper-2 p-1', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'h-9 flex-1 rounded-btn-sm text-sm transition-colors focus-visible:outline-none focus-visible:shadow-focus',
              active ? 'bg-surface font-semibold text-ink shadow-[0_0_0_1px_var(--color-line)]' : 'text-ink-2 hover:text-ink',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
