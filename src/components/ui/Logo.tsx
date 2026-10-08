import { cn } from '@/lib/cn.ts';

interface LogoProps {
  /** onInk: ô vàng + chữ trắng, dùng trên nền tối. */
  tone?: 'default' | 'onInk';
  size?: 'md' | 'sm';
  className?: string;
}

/** Ô vuông r9 có mái nhà + 2 vạch, kèm chữ "NestFair" Fraunces 700 (Design.md mục 4). */
export function Logo({ tone = 'default', size = 'md', className }: LogoProps) {
  const onInk = tone === 'onInk';
  const fg = onInk ? 'fill-ink stroke-ink' : 'fill-hl stroke-hl';
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 32 32" className={size === 'md' ? 'size-8' : 'size-7'} aria-hidden>
        <rect width="32" height="32" rx="9" className={onInk ? 'fill-hl' : 'fill-ink'} />
        <path
          d="M8 15.5 16 8.5l8 7"
          className={cn(fg, 'fill-none')}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="10" y="18" width="12" height="2.6" rx="1.3" className={fg} strokeWidth="0" />
        <rect x="10" y="22.6" width="12" height="2.6" rx="1.3" className={fg} strokeWidth="0" />
      </svg>
      <span
        className={cn(
          'font-display text-logo',
          size === 'sm' && 'text-[20px]',
          onInk ? 'text-white' : 'text-ink',
        )}
      >
        NestFair
      </span>
    </span>
  );
}
