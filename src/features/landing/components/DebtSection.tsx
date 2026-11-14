import { Check, RotateCcw } from 'lucide-react';
import { m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useReducer, useRef } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { InView, InViewItem } from '@/components/ui/Reveal.tsx';
import { cn } from '@/lib/cn.ts';
import { variants } from '@/lib/motion.ts';
import { useTimers } from '@/lib/timers.ts';
import { useCountUp } from '@/lib/use-count-up.ts';
import { AFTER_TRANSFERS, BEFORE_DEBTS, shortAmount, total } from '../debt-demo.ts';
import { AFTER_DELAY_MS, debtPlayback, initialPlayback } from '../debt-playback.ts';
import { DebtGraph } from './DebtGraph.tsx';
import { SectionHeading } from './SectionHeading.tsx';

const POINTS = [
  'Tự tính số dư ròng của từng người',
  'Thuật toán Min Cash Flow chọn đường trả ngắn nhất',
  'Mỗi giao dịch có VietQR điền sẵn số tiền',
];

/** Số giao dịch đếm lùi từ 6 khoản nợ chéo về 2 khi gom xong. Trình đọc màn hình đọc thẳng số cuối. */
function CollapseCount({ collapsed }: { collapsed: boolean }) {
  const n = useCountUp(collapsed ? AFTER_TRANSFERS.length : BEFORE_DEBTS.length, { from: BEFORE_DEBTS.length });
  return (
    <>
      <span aria-hidden>{n}</span>
      <span className="sr-only">{AFTER_TRANSFERS.length}</span>
    </>
  );
}

/**
 * Khối tối "Rút gọn nợ": giải thích thuật toán và so sánh sơ đồ trước / sau với số liệu Nhà 12A. Cuộn tới thì
 * 6 khoản nợ chéo vẽ ra, rồi gom còn 2 giao dịch; có nút Xem lại. Giảm chuyển động thì hiện sẵn kết quả.
 */
export function DebtSection() {
  const reduceMotion = useReducedMotion();
  const [play, dispatch] = useReducer(debtPlayback, reduceMotion, initialPlayback);
  const graphsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(graphsRef, { once: true, amount: 0.4 });
  const timers = useTimers();

  useEffect(() => {
    if (!inView) return;
    dispatch('enter');
    if (reduceMotion) dispatch('drawn');
  }, [inView, reduceMotion]);

  useEffect(() => {
    if (play.phase === 'before') timers.after(AFTER_DELAY_MS, () => dispatch('drawn'));
  }, [play.phase, play.run, timers]);

  const collapsed = play.phase === 'after';
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
          <InView as="ul" stagger className="mt-8 flex flex-col gap-3.5">
            {POINTS.map((p) => (
              <InViewItem as="li" key={p} className="flex items-center gap-3 text-b text-white">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-hl text-ink" aria-hidden>
                  <Check className="size-4" strokeWidth={3} />
                </span>
                {p}
              </InViewItem>
            ))}
          </InView>
        </div>

        <div ref={graphsRef} className="rounded-modal bg-surface p-5 sm:p-7">
          <div className="grid gap-8 sm:grid-cols-2 sm:gap-0 sm:divide-x sm:divide-line">
            <figure className="sm:pr-5">
              <figcaption className="text-center font-mono text-over uppercase text-ink-2">Trước</figcaption>
              <DebtGraph
                key={`before-${play.run}`}
                drawn={play.phase !== 'idle'}
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
                key={`after-${play.run}`}
                drawn={collapsed}
                variant="after"
                transfers={AFTER_TRANSFERS}
                summary="Sau khi rút gọn: Thiện chuyển cho Mai 380 nghìn đồng, Hùng chuyển cho Quân 170 nghìn đồng."
              />
              <m.div
                key={play.run}
                variants={variants.fadeUp}
                initial={reduceMotion ? false : 'hidden'}
                animate={collapsed ? 'visible' : 'hidden'}
                className="mt-3 flex justify-center"
              >
                <Chip tone="hl">
                  {/* Một span duy nhất: Chip là flex có gap, tách số và chữ ra hai item sẽ dư khoảng trống. */}
                  <span>
                    <CollapseCount collapsed={collapsed} /> giao dịch · {shortAmount(total(AFTER_TRANSFERS))}
                  </span>
                </Chip>
              </m.div>
            </figure>
          </div>
          {!reduceMotion && (
            // Chỉ hiện khi đã gom xong; ẩn bằng `invisible` để giữ chỗ (không xô bố cục) và không nhận focus.
            <div className={cn('mt-5 flex justify-center', !collapsed && 'invisible')}>
              <Button variant="secondary" size="sm" leftIcon={<RotateCcw />} onClick={() => dispatch('replay')}>
                Xem lại
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
