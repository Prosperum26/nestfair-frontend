import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

interface IconButtonProps extends ComponentProps<'button'> {
  icon: ReactNode;
  /** Bắt buộc: nút chỉ có icon cần nhãn cho trình đọc màn hình. */
  label: string;
  /** Chấm thông báo góc trên phải. */
  dot?: boolean;
}

/** 40×40, r12, nền surface, viền line, icon 20 (Design.md mục 3). */
export function IconButton({ icon, label, dot, className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'relative inline-flex size-10 shrink-0 items-center justify-center rounded-btn border border-line bg-surface text-ink',
        'hover:bg-paper focus-visible:outline-none focus-visible:shadow-focus [&_svg]:size-5',
        className,
      )}
      {...props}
    >
      {icon}
      {dot && (
        <span className="absolute top-1.5 right-1.5 size-2 rounded-full border-2 border-surface bg-tom-v" />
      )}
    </button>
  );
}
