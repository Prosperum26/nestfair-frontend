import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

interface InputProps extends ComponentProps<'input'> {
  leftIcon?: ReactNode;
  /** Nút / chữ bên phải trong ô (ví dụ nút hiện mật khẩu). */
  rightSlot?: ReactNode;
  invalid?: boolean;
}

/**
 * Ô nhập h48 r12 (Design.md mục 3). Viền và halo vẽ ở khung bọc để icon nằm trong ô.
 * Focus: viền 1.5 ink + halo hl-soft. Lỗi: viền 1.5 tom.
 */
export function Input({
  leftIcon,
  rightSlot,
  invalid,
  className,
  id,
  ...props
}: InputProps) {
  return (
    <div
      className={cn(
        'flex h-12 items-center gap-2.5 rounded-btn border bg-surface px-3.5 transition-shadow',
        'focus-within:border-[1.5px] focus-within:shadow-focus',
        invalid
          ? 'border-[1.5px] border-tom'
          : 'border-line-2 focus-within:border-ink',
        props.disabled && 'bg-paper-2',
        className,
      )}
    >
      {leftIcon && (
        <span className="flex shrink-0 text-ink-3 [&_svg]:size-[18px]" aria-hidden>
          {leftIcon}
        </span>
      )}
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && id ? `${id}-error` : undefined}
        className="h-full min-w-0 flex-1 bg-transparent text-b text-ink outline-none placeholder:text-ink-3"
        {...props}
      />
      {rightSlot}
    </div>
  );
}
