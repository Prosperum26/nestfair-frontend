import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

/** Một lựa chọn dạng thẻ trong nhóm radio (hộp thoại xóa thành viên, rời nhà). */
export function OptionCard({
  checked,
  onSelect,
  title,
  description,
  aside,
}: {
  checked: boolean;
  onSelect: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Phần bên phải (số dư mới…). */
  aside?: ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-btn border bg-surface px-4 py-3 text-left focus-visible:outline-none focus-visible:shadow-focus',
        checked ? 'border-[1.5px] border-ink bg-hl-soft' : 'border-line-2 hover:bg-paper',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px]',
          checked ? 'border-ink' : 'border-line-2',
        )}
        aria-hidden
      >
        {checked && <span className="size-2 rounded-full bg-ink" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        {description && <span className="mt-0.5 block text-cap text-ink-2">{description}</span>}
      </span>
      {aside}
    </button>
  );
}
