import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';
import { type Tone, TONES } from './tones.ts';

/** Ô vuông bo size × 0.3, icon = size × 0.5 (Design.md mục 3). */
export function IconTile({
  icon,
  tone = 'neutral',
  size = 40,
  className,
}: {
  icon: ReactNode;
  tone?: Tone;
  size?: 24 | 32 | 36 | 40 | 44 | 48;
  className?: string;
}) {
  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', TONES[tone], className)}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.3) }}
      aria-hidden
    >
      <span className="flex [&_svg]:size-full" style={{ width: size / 2, height: size / 2 }}>
        {icon}
      </span>
    </span>
  );
}
