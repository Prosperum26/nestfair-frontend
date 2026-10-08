import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';
import { IconTile } from './IconTile.tsx';
import type { Tone } from './tones.ts';

/** Trạng thái trống / chưa có dữ liệu: icon tile + tiêu đề + mô tả + hành động. */
export function EmptyState({
  icon,
  tone = 'neutral',
  title,
  description,
  action,
  className,
}: {
  icon: ReactNode;
  tone?: Tone;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-10 text-center', className)}>
      <IconTile icon={icon} tone={tone} size={48} />
      <h2 className="mt-4 text-h4 text-ink">{title}</h2>
      {description && <p className="mt-1.5 max-w-[420px] text-sm text-ink-2">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
