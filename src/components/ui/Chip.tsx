import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';
import { type Tone, TONES } from './tones.ts';

/** h26 (nhỏ h22), px10, pill, chữ capb, icon 14 (Design.md mục 3). */
export function Chip({
  children,
  tone = 'neutral',
  icon,
  size = 'md',
  className,
}: {
  children: ReactNode;
  tone?: Tone | 'outline';
  icon?: ReactNode;
  size?: 'md' | 'sm';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 text-cap font-semibold whitespace-nowrap [&_svg]:size-3.5',
        size === 'md' ? 'h-[26px]' : 'h-[22px]',
        tone === 'outline' ? 'border border-line-2 bg-surface text-ink' : TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
