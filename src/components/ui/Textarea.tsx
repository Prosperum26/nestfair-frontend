import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn.ts';

interface TextareaProps extends ComponentProps<'textarea'> {
  invalid?: boolean;
}

/** Ô nhập nhiều dòng, cùng viền / halo với Input (Design.md mục 3). */
export function Textarea({ invalid, className, id, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn(
        'min-h-[132px] w-full resize-y rounded-btn border bg-surface px-3.5 py-3 text-b text-ink outline-none transition-shadow placeholder:text-ink-3',
        'focus:border-[1.5px] focus:shadow-focus',
        invalid ? 'border-[1.5px] border-tom' : 'border-line-2 focus:border-ink',
        props.disabled && 'bg-paper-2',
        className,
      )}
      {...props}
    />
  );
}
