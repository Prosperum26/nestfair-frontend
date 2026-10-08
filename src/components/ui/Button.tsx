import { LoaderCircle } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'onInk';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-white',
  // CTA chính của màn: vàng, viền ink, bóng đặc 3/3.
  accent:
    'bg-hl text-ink border-[1.5px] border-ink shadow-hard active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  secondary: 'bg-surface text-ink border border-line-2 hover:bg-paper',
  ghost: 'bg-transparent text-ink hover:bg-paper-2',
  onInk: 'bg-ink-soft text-white border border-ink-line',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 rounded-btn-sm text-btns [&_svg]:size-4',
  md: 'h-11 px-[18px] rounded-btn text-btn [&_svg]:size-[18px]',
  lg: 'h-[52px] px-6 rounded-btn text-btn [&_svg]:size-[18px]',
};

interface ButtonProps extends ComponentProps<'button'> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  fullWidth,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors',
        'focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : leftIcon}
      {children}
    </button>
  );
}
