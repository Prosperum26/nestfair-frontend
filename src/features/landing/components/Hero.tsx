import { ArrowRight, KeyRound, ScanLine, ShoppingCart, Sparkles } from 'lucide-react';
import { AnimatePresence, m, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { CountUpVnd } from '@/components/ui/CountUpVnd.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { LinkButton } from '@/components/ui/LinkButton.tsx';
import { LedgerRow, Receipt } from '@/components/ui/Receipt.tsx';
import { Stamp } from '@/components/ui/Stamp.tsx';
import { cn } from '@/lib/cn.ts';
import { formatVnd } from '@/lib/format.ts';
import { delayed, variants } from '@/lib/motion.ts';
import { AFTER_TRANSFERS, PEOPLE } from '../debt-demo.ts';
import { PERSON_TONE } from '../people.ts';
import { advanceTicker, shouldRunTicker, TICKER_EVENTS, TICKER_INTERVAL_MS, type TickerState } from '../ticker.ts';

const RECEIPT_ROWS = [
  { key: 'H', amount: 110_000 },
  { key: 'T', amount: 120_000 },
  { key: 'M', amount: 140_000 },
  { key: 'Q', amount: 150_000 },
] as const;

const RECEIPT_TOTAL = RECEIPT_ROWS.reduce((sum, r) => sum + r.amount, 0);

/** Nhịp mở màn (giây): marker, ba thẻ rơi vào chỗ, hóa đơn in từng dòng, cuối cùng đóng dấu. */
const T = { marker: 0.35, debt: 0.1, receipt: 0.25, rows: 0.55, rowStep: 0.08, stamp: 1.1, toast: 0.45 } as const;

function Person({ k, size = 24 }: { k: keyof typeof PEOPLE; size?: number }) {
  return <Avatar name={PEOPLE[k].name} tone={PERSON_TONE[k]} size={size} />;
}

/** Thẻ tối "Rút gọn nợ · tháng 10" (góc trên phải của hero). */
function DebtSummaryCard() {
  return (
    <m.div
      variants={delayed(variants.dropIn, T.debt)}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[320px] rounded-card bg-ink p-5 text-white lg:absolute lg:top-0 lg:right-0 lg:w-[300px] lg:rotate-[3deg]"
    >
      <p className="font-mono text-over uppercase text-ink-on2">Rút gọn nợ · tháng 10</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex h-[26px] items-center rounded-full border border-ink-line bg-ink-soft px-2.5 text-cap font-semibold whitespace-nowrap text-white">
          6 khoản nợ chéo
        </span>
        <ArrowRight className="size-4 text-ink-on2" aria-hidden />
        <Chip tone="hl">2 giao dịch</Chip>
      </div>
      <ul className="mt-4 flex flex-col gap-2.5">
        {AFTER_TRANSFERS.map((t) => (
          <li key={t.from + t.to} className="flex items-center gap-2 text-sm font-medium">
            <Person k={t.from} size={22} />
            <span>
              {PEOPLE[t.from].name} → {PEOPLE[t.to].name}
            </span>
            <span className="h-0 flex-1 translate-y-1 border-b-[1.5px] border-dotted border-ink-line" />
            <span className="font-mono text-ms text-hl">{formatVnd(t.amount)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-cap text-ink-on2">Mỗi giao dịch có VietQR điền sẵn.</p>
    </m.div>
  );
}

/** Hóa đơn răng cưa "Đi chợ cuối tuần" kèm con dấu ĐÃ NHẬN. */
function ReceiptCard() {
  return (
    <m.div
      variants={delayed(variants.dropIn, T.receipt)}
      initial="hidden"
      animate="visible"
      className="relative max-lg:mb-12 lg:absolute lg:top-[210px] lg:left-0 lg:-rotate-[2deg]"
    >
      <Receipt>
        <div className="flex items-center gap-3">
          <IconTile icon={<ShoppingCart />} tone="mint" size={36} />
          <div className="min-w-0">
            <p className="truncate text-h4 text-ink">Đi chợ cuối tuần</p>
            <p className="font-mono text-cap text-ink-2">04.10 · Quân trả</p>
          </div>
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <span className="text-sm text-ink-2">Tổng hóa đơn</span>
          <span className="font-mono text-ml text-ink">
            <CountUpVnd value={RECEIPT_TOTAL} delay={T.rows} />
          </span>
        </div>
        <div className="mt-2">
          <Chip tone="lil" size="sm" icon={<ScanLine />}>
            Chính xác
          </Chip>
        </div>
        <div className="mt-4 flex flex-col gap-2.5 border-t border-dashed border-line-2 pt-4">
          {RECEIPT_ROWS.map((r, i) => (
            <m.div key={r.key} variants={delayed(variants.fadeUp, T.rows + i * T.rowStep)} initial="hidden" animate="visible">
              <LedgerRow
                left={
                  <>
                    <Person k={r.key} size={22} />
                    {PEOPLE[r.key].name}
                  </>
                }
                amount={formatVnd(r.amount)}
              />
            </m.div>
          ))}
        </div>
        {/* Dải trống ở cuối hóa đơn dành cho con dấu, để dấu không che số tiền. */}
        <p className="mt-4 flex h-14 items-end text-cap text-ink-2">4/4 người đã xác nhận</p>
      </Receipt>
      {/* stampIn tự xoay −8°, nên con dấu chỉ xoay thêm −4° để giữ góc −12° như ảnh thiết kế. */}
      <m.div
        variants={delayed(variants.stampIn, T.stamp)}
        initial="hidden"
        animate="visible"
        className="absolute -right-3 -bottom-12 max-sm:-right-1"
      >
        <Stamp label="ĐÃ NHẬN" date="06.10.2026" tone="mint" rotate={-4} />
      </m.div>
    </m.div>
  );
}

function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible');
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);
  return visible;
}

/**
 * Toast hoạt động của Nhà 12A: bắt đầu bằng "Mai đã duyệt Rửa chén" như ảnh thiết kế, đổi sự kiện mỗi 4 giây
 * trong một vòng rồi dừng. Tạm dừng khi trỏ chuột vào, khi cuộn khỏi màn hình hoặc tab bị ẩn.
 */
function ActivityToast() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const reduceMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const [paused, setPaused] = useState(false);
  const [state, setState] = useState<TickerState>({ index: 0, steps: 0 });
  const run = shouldRunTicker({ reduceMotion, inView, pageVisible, paused });

  useEffect(() => {
    const next = run ? advanceTicker(state, TICKER_EVENTS.length) : null;
    if (!next) return;
    const timer = setTimeout(() => setState(next), TICKER_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [run, state]);

  const e = TICKER_EVENTS[state.index];
  return (
    <m.div
      ref={ref}
      variants={delayed(variants.dropIn, T.toast)}
      initial="hidden"
      animate="visible"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="w-full max-w-[320px] overflow-hidden rounded-btn border-[1.5px] border-ink bg-surface p-3 shadow-hard lg:absolute lg:top-[330px] lg:right-0 lg:w-[270px]"
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.div key={state.index} variants={variants.tickerSwap} initial="hidden" animate="visible" exit="exit" className="flex items-center gap-3">
          <Person k={e.who} size={32} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{e.title}</p>
            <p className={cn('truncate text-cap', e.tone === 'mint' ? 'text-mint' : 'text-ink-2')}>
              {e.note}
              {e.amount !== undefined && (
                <>
                  {' · '}
                  <span className="font-mono">{formatVnd(e.amount)}</span>
                </>
              )}
            </p>
          </div>
        </m.div>
      </AnimatePresence>
    </m.div>
  );
}

/** Hero: tiêu đề có marker bút dạ quang duy nhất của màn, hai CTA, và cụm thẻ minh họa Nhà 12A. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line" aria-labelledby="hero-title">
      <GridPaper tone="paper" />
      <div className="relative mx-auto grid max-w-page items-center gap-14 px-4 pt-10 pb-20 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:px-6 lg:pt-20 lg:pb-28 xl:px-0">
        <div>
          <Chip tone="yellow" icon={<Sparkles />}>
            Mới · Rút gọn nợ tự động
          </Chip>
          <h1
            id="hero-title"
            className="mt-5 font-display text-[40px] leading-[46px] font-bold tracking-[-1px] text-ink lg:text-[64px] lg:leading-[70px] lg:tracking-[-1.6px]"
          >
            Ở chung vui hơn khi mọi thứ đều{' '}
            <span className="relative inline-block isolate">
              <m.span
                aria-hidden
                variants={delayed(variants.markerSweep, T.marker)}
                initial="hidden"
                animate="visible"
                style={{ originX: 0 }}
                className="absolute inset-x-[-4px] bottom-[0.06em] -z-10 h-[0.42em] rounded-[3px] bg-hl"
              />
              công bằng.
            </span>
          </h1>
          <p className="mt-5 max-w-[520px] text-b text-ink-2 lg:text-[17px] lg:leading-7">
            NestFair là sổ chung của nhà trọ: ghi chi tiêu, chia tiền tới từng đồng, xoay vòng việc nhà và gom nợ qua lại thành ít
            giao dịch nhất, trả bằng VietQR.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton to="/register" variant="accent" size="lg" rightIcon={<ArrowRight />}>
              Tạo nhà miễn phí
            </LinkButton>
            <LinkButton to="/register" variant="secondary" size="lg" leftIcon={<KeyRound />}>
              Tôi có mã mời
            </LinkButton>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <div className="flex -space-x-1.5" aria-hidden>
              {(['H', 'T', 'M', 'Q'] as const).map((k) => (
                <span key={k} className="rounded-full ring-2 ring-paper">
                  <Person k={k} size={28} />
                </span>
              ))}
            </div>
            <p className="text-cap text-ink-2">Cho phòng 2–8 người · Miễn phí · Không quảng cáo</p>
          </div>
        </div>

        <div className="relative flex flex-col items-start gap-5 max-lg:items-center lg:block lg:h-[620px]">
          <DebtSummaryCard />
          <ReceiptCard />
          <ActivityToast />
        </div>
      </div>
    </section>
  );
}
