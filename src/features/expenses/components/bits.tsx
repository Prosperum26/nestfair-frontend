import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { CATEGORY_META } from '../category.ts';
import { monthLabel } from '../month.ts';
import type { ExpenseCategory } from '../types.ts';

/** Icon tile của danh mục (Design.md mục 3, Icon tile category chi tiêu). */
export function CategoryTile({ category, size = 36 }: { category: ExpenseCategory; size?: 32 | 36 | 40 | 44 }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return <IconTile icon={<Icon />} tone={meta.tone} size={size} />;
}

/** Avatar + tên gọi; là người đang xem thì hiện "Bạn". */
export function Person({
  user,
  meId,
  size = 24,
  className,
}: {
  user: { id: string; fullName: string; avatarUrl: string | null };
  meId: string | undefined;
  size?: number;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex min-w-0 items-center gap-2', className)}>
      <Avatar name={user.fullName} tone={avatarToneFor(user.id)} src={user.avatarUrl} size={size} />
      <span className="truncate">{user.id === meId ? 'Bạn' : firstName(user.fullName)}</span>
    </span>
  );
}

/** "‹ Tháng 10.2026 ›" (ảnh 07). Không cho sang tháng sau tháng hiện tại. */
export function MonthSwitcher({ month, onChange, max }: { month: string; onChange: (delta: number) => void; max: string }) {
  const btn =
    'flex size-10 items-center justify-center rounded-btn-sm text-ink hover:bg-paper-2 focus-visible:outline-none focus-visible:shadow-focus disabled:opacity-[0.38] disabled:pointer-events-none';
  return (
    <div className="flex h-11 items-center rounded-btn border border-line-2 bg-surface px-0.5">
      <button type="button" className={btn} onClick={() => onChange(-1)} aria-label="Tháng trước">
        <ChevronLeft className="size-[18px]" aria-hidden />
      </button>
      <span className="min-w-[124px] text-center text-sm font-semibold text-ink" aria-live="polite">
        {monthLabel(month)}
      </span>
      <button type="button" className={btn} onClick={() => onChange(1)} disabled={month >= max} aria-label="Tháng sau">
        <ChevronRight className="size-[18px]" aria-hidden />
      </button>
    </div>
  );
}

/** Ghi chú nền sky (thông tin trung tính). */
export function InfoNote({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('rounded-btn bg-sky-bg px-4 py-3 text-cap text-sky', className)}>{children}</p>;
}
