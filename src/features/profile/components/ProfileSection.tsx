import type { ReactNode } from 'react';

/** Thẻ một mục của hồ sơ: overline mono (tùy chọn) → tiêu đề Fraunces → nội dung. `id` để thanh điều hướng cuộn tới. */
export function ProfileSection({
  id,
  overline,
  title,
  aside,
  children,
}: {
  id: string;
  overline?: string;
  title: string;
  /** Phần tử bên phải tiêu đề (chip trạng thái). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={'scroll-mt-24 rounded-card border border-line bg-surface p-5 sm:p-6'}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {overline && <p className="font-mono text-over uppercase text-ink-2">{overline}</p>}
          <h2 id={`${id}-title`} className="font-display text-ct text-ink">
            {title}
          </h2>
        </div>
        {aside}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
