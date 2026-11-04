import { Check } from 'lucide-react';
import { Chip } from '@/components/ui/Chip.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { AFTER_TRANSFERS, BEFORE_DEBTS, shortAmount, total } from '../debt-demo.ts';
import { DebtGraph } from './DebtGraph.tsx';
import { SectionHeading } from './SectionHeading.tsx';

const POINTS = [
  'Tự tính số dư ròng của từng người',
  'Thuật toán Min Cash Flow chọn đường trả ngắn nhất',
  'Mỗi giao dịch có VietQR điền sẵn số tiền',
];

/** Khối tối "Rút gọn nợ": giải thích thuật toán và so sánh sơ đồ trước / sau với số liệu Nhà 12A. */
export function DebtSection() {
  return (
    <section id="debt" aria-labelledby="debt-title" className="relative scroll-mt-16 overflow-hidden bg-ink">
      <GridPaper tone="ink" />
      <div className="relative mx-auto grid max-w-page items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:gap-16 lg:px-6 lg:py-24 xl:px-0">
        <div>
          <SectionHeading
            id="debt-title"
            onInk
            overline="Rút gọn nợ"
            title={
              <>
                Nợ qua nợ lại?
                <br />
                Gom về ít giao dịch nhất.
              </>
            }
            description="NestFair tính số dư ròng của từng người rồi chọn đường trả ngắn nhất. Nhà 12A tháng 10 từ 6 khoản nợ chéo chỉ còn 2 lần chuyển khoản."
          />
          <ul className="mt-8 flex flex-col gap-3.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-b text-white">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-hl text-ink" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-modal bg-surface p-5 sm:p-7">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-line">
            <figure className="sm:pr-5">
              <figcaption className="text-center font-mono text-over uppercase text-ink-2">Trước</figcaption>
              <DebtGraph
                variant="before"
                transfers={BEFORE_DEBTS}
                summary="Trước khi rút gọn: 6 khoản nợ chéo giữa Hùng, Thiện, Mai và Quân, luân chuyển 640 nghìn đồng."
              />
              <div className="mt-3 flex justify-center">
                <Chip tone="neutral">
                  {BEFORE_DEBTS.length} khoản · {shortAmount(total(BEFORE_DEBTS))} luân chuyển
                </Chip>
              </div>
            </figure>
            <figure className="sm:pl-5">
              <figcaption className="text-center font-mono text-over uppercase text-ink-2">Sau khi rút gọn</figcaption>
              <DebtGraph
                variant="after"
                transfers={AFTER_TRANSFERS}
                summary="Sau khi rút gọn: Thiện chuyển cho Mai 380 nghìn đồng, Hùng chuyển cho Quân 170 nghìn đồng."
              />
              <div className="mt-3 flex justify-center">
                <Chip tone="hl">
                  {AFTER_TRANSFERS.length} giao dịch · {shortAmount(total(AFTER_TRANSFERS))}
                </Chip>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
