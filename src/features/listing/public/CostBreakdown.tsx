import { LedgerRow } from '@/components/ui/Receipt.tsx';
import { formatVnd } from '@/lib/format.ts';
import { costLines } from '../format.ts';
import type { PublicListingOpen } from '../types.ts';

export type CostBreakdownProps = Pick<PublicListingOpen, 'rentPerMonth' | 'otherFees' | 'summary' | 'estimatedPerPerson'>;

/** Thẻ "Chi phí chi tiết" dạng sổ cái. Tổng lấy từ server (`estimatedPerPerson`), cùng công thức với poster. */
export function CostBreakdown({ rentPerMonth, otherFees, summary, estimatedPerPerson }: CostBreakdownProps) {
  const { utilities } = summary;
  const lines = costLines({
    rentPerMonth,
    utilitiesPerPerson: utilities?.perPerson ?? null,
    utilitiesMonthsUsed: utilities?.monthsUsed ?? null,
    otherFees,
  });
  // Dòng điện nước luôn có mặt: chưa có dữ liệu thì nói rõ thay vì lặng lẽ bỏ qua.
  const rows = utilities ? lines : [lines[0], { label: 'Điện nước', amount: null }, ...lines.slice(1)];

  return (
    <section aria-labelledby="public-cost-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <h2 id="public-cost-title" className="font-display text-ct text-ink">
        Chi phí chi tiết
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((row, i) => (
          <LedgerRow
            key={`${row.label}-${i}`}
            left={<span className="font-normal">{row.label}</span>}
            amount={row.amount === null ? 'chưa có dữ liệu' : formatVnd(row.amount)}
          />
        ))}
      </div>
      <div className="mt-4 border-t-[1.5px] border-dashed border-line-2 pt-4">
        <LedgerRow left={<span className="font-semibold">Tổng ước tính</span>} amount={formatVnd(estimatedPerPerson)} />
      </div>
    </section>
  );
}
