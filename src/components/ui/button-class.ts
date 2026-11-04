import { cn } from '@/lib/cn.ts';

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'onInk' | 'danger' | 'dangerSoft';
export type ButtonSize = 'sm' | 'md' | 'lg';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-white',
  // CTA chính của màn: vàng, viền ink, bóng đặc 3/3.
  accent:
    'bg-hl text-ink border-[1.5px] border-ink shadow-hard active:translate-x-[3px] active:translate-y-[3px] active:shadow-none',
  secondary: 'bg-surface text-ink border border-line-2 hover:bg-paper',
  ghost: 'bg-transparent text-ink hover:bg-paper-2',
  onInk: 'bg-ink-soft text-white border border-ink-line',
  danger: 'bg-tom text-white',
  dangerSoft: 'bg-surface text-tom border border-tom-border hover:bg-tom-bg',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 rounded-btn-sm text-btns [&_svg]:size-4',
  md: 'h-11 px-[18px] rounded-btn text-btn [&_svg]:size-[18px]',
  lg: 'h-[52px] px-6 rounded-btn text-btn [&_svg]:size-[18px]',
};

/** Lớp CSS của nút, dùng chung cho <button> và các thẻ liên kết trông như nút (LinkButton). */
export function buttonClass({ variant = 'primary', size = 'md', fullWidth }: { variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean } = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors',
    'focus-visible:outline-none focus-visible:shadow-focus',
    'disabled:pointer-events-none disabled:opacity-[0.38] disabled:shadow-none',
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
  );
}

