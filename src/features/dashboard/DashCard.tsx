import type { ReactNode } from 'react';
import { cn } from '@/lib/cn.ts';

/** Thẻ Tổng quan: header = overline + tiêu đề (ct) bên trái, chip/link bên phải (Design.md mục 3, Card). */
export function DashCard({
  overline,
  title,
  aside,
  children,
  className,
}: {
  overline?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('flex flex-col rounded-card border border-line bg-surface p-4 sm:p-6', className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {overline && <p className="font-mono text-over uppercase text-ink-2">{overline}</p>}
          <h2 className={cn('font-display text-ct text-ink', overline && 'mt-1')}>{title}</h2>
        </div>
        {aside}
      </header>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Chỗ trống trong thẻ khi module chưa có dữ liệu. */
export function CardEmpty({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-btn border border-dashed border-line-2 px-4 py-8 text-center">
      <span className="text-ink-3 [&_svg]:size-6" aria-hidden>
        {icon}
      </span>
      <p className="max-w-[320px] text-sm text-ink-2">{children}</p>
    </div>
  );
}
