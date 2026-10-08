import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

interface FieldProps {
  label: string;
  htmlFor: string;
  /** Thông báo lỗi; có lỗi thì ẩn hint. */
  error?: string;
  hint?: ReactNode;
  /** Phần tử bên phải nhãn, ví dụ link "Quên mật khẩu?". */
  labelAction?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Nhãn + ô nhập + dòng lỗi/gợi ý (Design.md mục 3, Field). */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  labelAction,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
          {label}
        </label>
        {labelAction}
      </div>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-0.5 flex items-start gap-1.5 text-cap text-tom"
        >
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <div className="mt-0.5 text-cap text-ink-2">{hint}</div>
      )}
    </div>
  );
}
