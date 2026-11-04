import { cn } from '@/lib/cn.ts';

/** Công tắc bật/tắt (Design.md, hồ sơ): nền ink + núm hl khi bật, nền line-2 + núm trắng khi tắt. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Tên truy cập (đọc bởi trình đọc màn hình). */
  label: string;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-60',
        checked ? 'bg-ink' : 'bg-line-2',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-1 size-5 rounded-full transition-[left]',
          checked ? 'left-[24px] bg-hl' : 'left-1 bg-surface',
        )}
      />
    </button>
  );
}
