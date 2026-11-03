import { ChevronDown, CircleCheck, Info, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { cn } from '@/lib/cn.ts';
import { formatVnd } from '@/lib/format.ts';
import { netSummary } from '../plan-view.ts';
import type { SettlementPlan } from '../types.ts';
import { DebtGraph } from './DebtGraph.tsx';

/**
 * Thẻ "Rút gọn nợ" (ảnh 09): sơ đồ trước / sau Min Cash Flow. Desktop hiện hai sơ đồ cạnh nhau;
 * mobile hiện sơ đồ "sau", sơ đồ "trước" mở bằng nút.
 */
export function DebtSimplifyCard({ plan }: { plan: SettlementPlan }) {
  const [showBefore, setShowBefore] = useState(false);
  const rawCount = plan.raw.length;
  const optCount = plan.optimized.length;

  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-over uppercase text-ink-2">
            {rawCount} khoản nợ chéo → {optCount} giao dịch
          </p>
          <h2 className="mt-1 font-display text-ct text-ink">Rút gọn nợ</h2>
        </div>
        <Chip tone="lil" icon={<Sparkles />}>
          Min Cash Flow
        </Chip>
      </header>

      {optCount === 0 ? (
        <EmptyState icon={<CircleCheck />} tone="mint" title="Cả nhà đã sòng phẳng" description="Không ai nợ ai. Ghi khoản chi mới thì NestFair sẽ tính lại." />
      ) : (
        <>
          <div className="mt-5 grid gap-6 lg:grid-cols-2 lg:divide-x lg:divide-line">
            <div className={cn('flex flex-col items-center gap-3 lg:pr-6', !showBefore && 'max-lg:hidden')}>
              <p className="font-mono text-over uppercase text-ink-2">Trước</p>
              <DebtGraph members={plan.members} transfers={plan.raw} variant="before" label="Sơ đồ nợ chéo trước khi rút gọn" />
              <Chip>
                {rawCount} khoản · <span className="font-mono">{formatVnd(plan.rawTotal)}</span> luân chuyển
              </Chip>
            </div>
            <div className="flex flex-col items-center gap-3 lg:pl-6">
              <p className="font-mono text-over uppercase text-ink-2 max-lg:hidden">Sau khi rút gọn</p>
              <DebtGraph members={plan.members} transfers={plan.optimized} variant="after" label="Sơ đồ chuyển tiền sau khi rút gọn" />
              <Chip tone="hl">
                {optCount} giao dịch · <span className="font-mono">{formatVnd(plan.optimizedTotal)}</span>
              </Chip>
            </div>
          </div>

          {rawCount > 0 && (
            <button
              type="button"
              aria-expanded={showBefore}
              onClick={() => setShowBefore((v) => !v)}
              className="mt-4 flex w-full items-center justify-between rounded-btn bg-paper-2 px-4 py-3 text-sm text-ink focus-visible:outline-none focus-visible:shadow-focus lg:hidden"
            >
              {showBefore ? 'Ẩn sơ đồ trước khi rút gọn' : `Xem ${rawCount} khoản trước khi rút gọn`}
              <ChevronDown className={cn('size-4 transition-transform', showBefore && 'rotate-180')} aria-hidden />
            </button>
          )}

          <p className="mt-5 flex items-start gap-2 rounded-btn bg-paper-2 px-4 py-3 text-cap text-ink-2">
            <Info className="mt-px size-4 shrink-0" aria-hidden />
            <span>
              Số dư ròng không đổi: <span className="font-mono">{netSummary(plan.members)}</span>. Chỉ đường chuyển tiền được rút ngắn.
            </span>
          </p>
        </>
      )}
    </section>
  );
}
