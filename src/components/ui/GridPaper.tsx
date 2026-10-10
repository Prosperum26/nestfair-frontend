import { useId } from 'react';
import { cn } from '@/lib/cn.ts';

/**
 * Lưới giấy kẻ ô 32px phủ nền (Design.md mục 3).
 * ink: trên khối tối (nét ink-line, opacity 0.45). paper: trên nền giấy (nét line).
 */
export function GridPaper({ tone = 'ink', className }: { tone?: 'ink' | 'paper'; className?: string }) {
  const id = useId();
  return (
    <svg className={cn('pointer-events-none absolute inset-0 size-full', className)} aria-hidden>
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M32 0V32M0 32H32"
            className={cn('fill-none', tone === 'ink' ? 'stroke-ink-line' : 'stroke-line')}
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} opacity={tone === 'ink' ? 0.45 : 0.7} />
    </svg>
  );
}
