import { ArrowRight, KeyRound, ScanLine, ShoppingCart, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { LinkButton } from '@/components/ui/LinkButton.tsx';
import { LedgerRow, Receipt } from '@/components/ui/Receipt.tsx';
import { Stamp } from '@/components/ui/Stamp.tsx';
import { formatVnd } from '@/lib/format.ts';
import { AFTER_TRANSFERS, PEOPLE } from '../debt-demo.ts';
import { PERSON_TONE } from '../people.ts';

const RECEIPT_ROWS = [
  { key: 'H', amount: 110_000 },
  { key: 'T', amount: 120_000 },
  { key: 'M', amount: 140_000 },
  { key: 'Q', amount: 150_000 },
] as const;

const RECEIPT_TOTAL = RECEIPT_ROWS.reduce((sum, r) => sum + r.amount, 0);

function Person({ k, size = 24 }: { k: keyof typeof PEOPLE; size?: number }) {
  return <Avatar name={PEOPLE[k].name} tone={PERSON_TONE[k]} size={size} />;
}

/** Thẻ tối "Rút gọn nợ · tháng 10" (góc trên phải của hero). */
function DebtSummaryCard() {
  return (
    <div className="w-full max-w-[320px] rounded-card bg-ink p-5 text-white lg:absolute lg:top-0 lg:right-0 lg:w-[300px] lg:rotate-[3deg]">
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
    </div>
  );
}

/** Hóa đơn răng cưa "Đi chợ cuối tuần" kèm con dấu ĐÃ NHẬN. */
function ReceiptCard() {
  return (
    <div className="relative max-lg:mb-12 lg:absolute lg:top-[210px] lg:left-0 lg:-rotate-[2deg]">
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
          <span className="font-mono text-ml text-ink">{formatVnd(RECEIPT_TOTAL)}</span>
        </div>
        <div className="mt-2">
          <Chip tone="lil" size="sm" icon={<ScanLine />}>
            Chính xác
          </Chip>
        </div>
        <div className="mt-4 flex flex-col gap-2.5 border-t border-dashed border-line-2 pt-4">
          {RECEIPT_ROWS.map((r) => (
            <LedgerRow
              key={r.key}
              left={
                <>
                  <Person k={r.key} size={22} />
                  {PEOPLE[r.key].name}
                </>
              }
              amount={formatVnd(r.amount)}
            />
          ))}
        </div>
        {/* Dải trống ở cuối hóa đơn dành cho con dấu, để dấu không che số tiền. */}
        <p className="mt-4 flex h-14 items-end text-cap text-ink-2">4/4 người đã xác nhận</p>
      </Receipt>
      <Stamp label="ĐÃ NHẬN" date="06.10.2026" tone="mint" className="absolute -right-3 -bottom-12 max-sm:-right-1" />
    </div>
  );
}

/** Toast "Mai đã duyệt Rửa chén" (minh họa việc nhà được duyệt). */
function ApprovedToast() {
  return (
    <div className="flex w-full max-w-[320px] items-center gap-3 rounded-btn border-[1.5px] border-ink bg-surface p-3 shadow-hard lg:absolute lg:top-[330px] lg:right-0 lg:w-[270px]">
      <Person k="M" size={32} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">Mai đã duyệt “Rửa chén”</p>
        <p className="text-cap text-mint">+10 điểm chăm chỉ cho Hùng</p>
      </div>
    </div>
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
              <span aria-hidden className="absolute inset-x-[-4px] bottom-[0.06em] -z-10 h-[0.42em] rounded-[3px] bg-hl" />
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
          <ApprovedToast />
        </div>
      </div>
    </section>
  );
}
