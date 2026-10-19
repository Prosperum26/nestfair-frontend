import { ArrowUpRight, Receipt, Scale, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import type { Tone } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { formatSignedVnd, formatVnd } from '@/lib/format.ts';
import { CATEGORY_META, categoryBarSegments } from '../category.ts';
import { monthNumber } from '../month.ts';
import type { ExpenseSummary } from '../types.ts';

/** Thanh theo danh mục: các đoạn liền nhau, cao 10, bo tròn. */
export function CategoryBar({ summary, className }: { summary: ExpenseSummary; className?: string }) {
  const segments = categoryBarSegments(summary.byCategory);
  if (segments.length === 0) return <div className={cn('h-2.5 rounded-full bg-paper-2', className)} aria-hidden />;
  return (
    <div className={cn('flex h-2.5 gap-1', className)} aria-hidden>
      {segments.map((s) => (
        <span key={s.category} className={cn('rounded-full', CATEGORY_META[s.category].bar)} style={{ width: `${s.percent}%` }} />
      ))}
    </div>
  );
}

/** Stat card (Design.md mục 3): overline + icon tile 32 → số ml → caption. */
function StatCard({ overline, icon, tone, value, caption }: { overline: string; icon: ReactNode; tone: Tone; value: string; caption: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5 rounded-card border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-over uppercase text-ink-2">{overline}</p>
        <IconTile icon={icon} tone={tone} size={32} />
      </div>
      <p className="font-mono text-ml text-ink">{value}</p>
      <div className="text-cap text-ink-2">{caption}</div>
    </section>
  );
}

function CategoryCard({ summary }: { summary: ExpenseSummary }) {
  return (
    <section className="rounded-card border border-line bg-surface p-5">
      <p className="font-mono text-over uppercase text-ink-2">Theo danh mục</p>
      <CategoryBar summary={summary} className="mt-4" />
      {summary.byCategory.length === 0 ? (
        <p className="mt-4 text-sm text-ink-2">Chưa có khoản chi nào trong tháng.</p>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-2">
          {summary.byCategory.slice(0, 4).map((c) => (
            <li key={c.category} className="flex items-center gap-2.5 text-sm text-ink-2">
              <span className={cn('size-2.5 shrink-0 rounded-[3px]', CATEGORY_META[c.category].bar)} aria-hidden />
              <span className="flex-1">{CATEGORY_META[c.category].label}</span>
              <span className="font-mono text-ms text-ink">{formatVnd(c.amount)}</span>
            </li>
          ))}
          {summary.byCategory.length > 4 && (
            <li className="text-cap text-ink-2">
              +{summary.byCategory.length - 4} danh mục khác ·{' '}
              <span className="font-mono">{formatVnd(summary.byCategory.slice(4).reduce((s, c) => s + c.amount, 0))}</span>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}

const diffCaption = (diff: number) =>
  diff === 0 ? (
    'Đã cân bằng trong tháng'
  ) : (
    <span className={diff < 0 ? 'text-tom' : 'text-mint'}>
      Chênh lệch <span className="font-mono">{formatSignedVnd(diff)}</span>
    </span>
  );

/** Desktop (ảnh 07): 3 stat card + thẻ theo danh mục. */
export function ExpenseStatsDesktop({ summary }: { summary: ExpenseSummary }) {
  return (
    <div className="hidden gap-6 lg:grid lg:grid-cols-[1fr_1fr_1fr_1.3fr]">
      <StatCard
        overline="Tổng chi tháng"
        icon={<Receipt />}
        tone="yellow"
        value={formatVnd(summary.totalAmount)}
        caption={`${summary.expenseCount} hóa đơn · ${summary.participantCount} người`}
      />
      <StatCard
        overline="Bạn đã trả"
        icon={<ArrowUpRight />}
        tone="lil"
        value={formatVnd(summary.paidByMe)}
        caption={`${summary.paidByMeCount} hóa đơn`}
      />
      <StatCard overline="Phần của bạn" icon={<Scale />} tone="tom" value={formatVnd(summary.myShare)} caption={diffCaption(summary.diff)} />
      <CategoryCard summary={summary} />
    </div>
  );
}

/** Mobile (ảnh 07 mobile): thẻ tối tổng tháng + thanh danh mục + bạn đã trả / phần của bạn. */
export function ExpenseStatsMobile({ summary }: { summary: ExpenseSummary }) {
  return (
    <section className="relative overflow-hidden rounded-card bg-ink p-5 lg:hidden">
      <GridPaper />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-over uppercase text-ink-on2">Tổng chi tháng {monthNumber(summary.month)}</p>
          <span className="rounded-full bg-hl px-2.5 py-0.5 text-cap font-semibold text-ink">{summary.expenseCount} hóa đơn</span>
        </div>
        <p className="mt-4 font-mono text-[40px] leading-[48px] font-bold tracking-[-1.5px] text-hl">{formatVnd(summary.totalAmount)}</p>
        <CategoryBar summary={summary} className="mt-4" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-cap text-ink-on2">Bạn đã trả</p>
            <p className="font-mono text-mm text-white">{formatVnd(summary.paidByMe)}</p>
          </div>
          <div>
            <p className="text-cap text-ink-on2">Phần của bạn</p>
            <p className="font-mono text-mm text-white">{formatVnd(summary.myShare)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ExpenseStatsSkeleton() {
  return (
    <>
      <Skeleton className="h-[220px] rounded-card lg:hidden" />
      <div className="hidden gap-6 lg:grid lg:grid-cols-[1fr_1fr_1fr_1.3fr]" aria-busy="true" aria-label="Đang tải thống kê">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[168px] rounded-card" />
        ))}
      </div>
    </>
  );
}

export function ExpenseStatsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-card border border-tom-border bg-tom-bg px-5 py-4 text-sm text-tom" role="alert">
      <TriangleAlert className="size-[18px]" aria-hidden />
      <span className="flex-1">Chưa tải được thống kê tháng.</span>
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}
