import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

/** Overline mono viết hoa → tiêu đề Fraunces → mô tả (pattern tiêu đề của Design.md). */
export function SectionHeading({
  overline,
  title,
  description,
  align = 'left',
  onInk = false,
  id,
  className,
}: {
  overline: string;
  title: ReactNode;
  description?: ReactNode;
  align?: 'left' | 'center';
  onInk?: boolean;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      <p className={cn('font-mono text-over uppercase', onInk ? 'text-hl' : 'text-ink-2')}>{overline}</p>
      <h2
        id={id}
        className={cn(
          'mt-3 font-display text-h1m font-semibold lg:text-h1',
          align === 'center' && 'mx-auto max-w-[640px] text-balance',
          onInk ? 'text-white' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && <p className={cn('mt-3 text-b', onInk ? 'text-ink-on2' : 'text-ink-2')}>{description}</p>}
    </div>
  );
}
