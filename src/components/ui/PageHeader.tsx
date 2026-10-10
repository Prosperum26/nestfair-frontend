import type { ReactNode } from 'react';

/** Pattern tiêu đề Design.md: overline mono viết hoa → tiêu đề Fraunces → mô tả sm; nút hành động bên phải. */
export function PageHeader({
  overline,
  title,
  description,
  actions,
}: {
  overline?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {overline && <p className="font-mono text-over uppercase text-ink-2">{overline}</p>}
        <h1 className="mt-2 font-display text-h1m text-ink lg:text-h1">{title}</h1>
        {description && <p className="mt-2 text-sm text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  );
}
