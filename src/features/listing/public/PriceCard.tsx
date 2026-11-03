import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { formatVnd } from '@/lib/format.ts';
import { priceNote } from '../public-state.ts';
import type { PublicListingOpen } from '../types.ts';

/** Thẻ giá tối (ink + lưới giấy): số mono lớn màu `hl`, kèm câu nói rõ giá đã gồm những gì. */
export function PriceCard({ listing }: { listing: Pick<PublicListingOpen, 'estimatedPerPerson' | 'summary' | 'otherFees'> }) {
  return (
    <section aria-label="Giá mỗi người mỗi tháng" className="relative overflow-hidden rounded-card bg-ink p-5 text-white sm:p-6">
      <GridPaper tone="ink" />
      <p className="relative font-mono text-over uppercase text-ink-on2">Mỗi người / tháng</p>
      <p className="relative mt-3 font-mono text-[36px] leading-[44px] font-bold tracking-[-1px] text-hl sm:text-[44px] sm:leading-[52px]">
        {formatVnd(listing.estimatedPerPerson)}
      </p>
      <p className="relative mt-3 text-sm text-ink-on2">{priceNote({ utilities: listing.summary.utilities, otherFees: listing.otherFees })}</p>
    </section>
  );
}
