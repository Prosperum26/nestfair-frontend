import { MapPin, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { Chip } from '@/components/ui/Chip.tsx';
import { genderLabel, listingHeadline } from '../format.ts';
import { publishedOverline } from '../public-state.ts';
import type { PublicListingOpen } from '../types.ts';
import { ContactBar } from './ContactBar.tsx';
import { CostBreakdown } from './CostBreakdown.tsx';
import { PriceCard } from './PriceCard.tsx';

/** Vệt bút dạ vàng sau chữ (đúng 1 lần mỗi màn, Design.md): khối màu đặc đặt phía sau, không dùng gradient. */
function Marker({ children }: { children: ReactNode }) {
  return (
    <span className="relative isolate whitespace-nowrap">
      <span aria-hidden className="absolute inset-x-[-3px] bottom-[0.1em] -z-10 h-[0.42em] rounded-[2px] bg-hl" />
      {children}
    </span>
  );
}

function Headline({ slotsOpen }: { slotsOpen: number }) {
  if (slotsOpen <= 0) return <>{listingHeadline(0)}</>;
  return (
    <>
      Còn <Marker>{slotsOpen} chỗ</Marker> ở ghép
    </>
  );
}

function Chips({ listing, className }: { listing: PublicListingOpen; className?: string }) {
  return (
    <div className={className}>
      <Chip tone="outline" icon={<Users aria-hidden />}>
        Đang có {listing.summary.memberCount} người
      </Chip>
      <Chip tone="outline">{genderLabel(listing.genderWanted)}</Chip>
    </div>
  );
}

function TextSection({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  const id = `public-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="font-display text-ct text-ink">
        {title}
      </h2>
      <p className="mt-2 text-b break-words whitespace-pre-line text-ink-2">{text}</p>
    </section>
  );
}

/**
 * Nội dung tin đang mở. Di động: 1 cột, thứ tự theo `order-*`. Từ `lg`: cột chính + cột phải dính;
 * hai bọc `contents` chỉ là hai cột thật ở desktop nên mỗi khối chỉ có MỘT bản trong DOM (không trùng id).
 */
export function PublicListingView({ listing }: { listing: PublicListingOpen }) {
  const overline = publishedOverline(listing.publishedAt);
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-6 pb-32 lg:pt-10 lg:pb-16">
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-8">
        <div className="contents lg:col-span-7 lg:flex lg:flex-col lg:gap-6">
          <header className="order-1 lg:order-none">
            {overline && <p className="font-mono text-over text-ink-2">{overline}</p>}
            <h1 className="mt-2 font-display text-h1m text-ink lg:text-h1">
              <Headline slotsOpen={listing.summary.slotsOpen} />
            </h1>
            <p className="mt-2 flex items-start gap-2 text-b text-ink-2">
              <MapPin className="mt-0.5 size-[18px] shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 break-words">{listing.locationText}</span>
            </p>
          </header>
          <div className="order-6 flex flex-col gap-6 lg:order-none">
            <TextSection title="Mô tả" text={listing.description} />
            <TextSection title="Mong muốn về bạn cùng phòng" text={listing.roommateExpectations} />
          </div>
          <p className="order-9 text-cap text-ink-2 lg:order-none">Tạo bằng NestFair · thông tin và ảnh do trưởng phòng cung cấp</p>
        </div>

        <div className="contents lg:col-span-5 lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-6">
          <div className="order-2 lg:order-none">
            <PriceCard listing={listing} />
          </div>
          <Chips listing={listing} className="order-4 flex flex-wrap gap-2 lg:hidden" />
          <div className="order-5 lg:order-none">
            <CostBreakdown
              rentPerMonth={listing.rentPerMonth}
              otherFees={listing.otherFees}
              summary={listing.summary}
              estimatedPerPerson={listing.estimatedPerPerson}
            />
          </div>
          <div className="hidden rounded-card border border-line bg-surface p-6 lg:flex lg:flex-col lg:gap-4">
            <Chips listing={listing} className="flex flex-wrap gap-2" />
            <ContactBar contact={listing.contact} variant="card" />
          </div>
        </div>
      </div>
      <ContactBar contact={listing.contact} />
    </div>
  );
}
