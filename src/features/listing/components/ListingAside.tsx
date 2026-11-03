import { type UseFormReturn, useFormState, useWatch } from 'react-hook-form';
import { Chip } from '@/components/ui/Chip.tsx';
import { estimateTotal, publicUrlDisplay } from '../format.ts';
import { coverPhoto } from '../photos.ts';
import type { ListingFormOutput, ListingFormValues } from '../schemas.ts';
import type { AdminListingResponse } from '../types.ts';
import { PosterActions } from './PosterActions.tsx';
import { PosterPreview } from './PosterPreview.tsx';
import { PublicLinkCard } from './PublicLinkCard.tsx';

/** Chưa có tin thì chưa có slug thật: QR xem trước chỉ để hiện hình, nút tải bị khóa tới khi tin được đăng. */
const PLACEHOLDER_URL = 'https://nestfair.app/r/xxxxxxxx';

/**
 * Cột phải của trang tin đăng (ảnh 20): poster xem trước theo nội dung ĐANG SOẠN (kể cả chưa lưu),
 * nút tải PNG và link công khai.
 */
export function ListingAside({ form, data }: { form: UseFormReturn<ListingFormValues, unknown, ListingFormOutput>; data: AdminListingResponse }) {
  const { listing, summary, publicUrl } = data;
  const live = useWatch({ control: form.control });
  const { isDirty } = useFormState({ control: form.control });

  const price = estimateTotal({
    rentPerMonth: live.rentPerMonth ?? 0,
    utilitiesPerPerson: summary.utilities?.perPerson ?? null,
    otherFees: (live.otherFees ?? []).map((f) => ({ amount: f?.amount ?? 0 })),
  });
  const qrValue = publicUrl ?? PLACEHOLDER_URL;
  const poster = {
    slotsOpen: summary.slotsOpen,
    memberCount: summary.memberCount,
    locationText: live.locationText?.trim() || 'Chưa nhập vị trí',
    genderWanted: live.genderWanted ?? 'ANY',
    pricePerPerson: price,
    utilitiesIncluded: summary.utilities !== null,
    coverUrl: coverPhoto(listing?.photos ?? [])?.url ?? null,
    qrValue,
    displayUrl: publicUrlDisplay(qrValue),
  } as const;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="listing-poster-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 id="listing-poster-title" className="font-display text-ct text-ink">
            Poster xem trước
          </h2>
          <Chip tone="outline" size="sm">
            1080 × 1350
          </Chip>
        </div>
        <div className="mt-4">
          <PosterPreview {...poster} />
        </div>
        {isDirty && <p className="mt-3 text-cap text-ink-2">Poster theo nội dung đang soạn. Lưu để trang công khai khớp với poster.</p>}
        <div className="mt-4">
          <PosterActions status={listing?.status ?? null} slug={listing?.slug ?? null} poster={poster} />
        </div>
      </section>
      <PublicLinkCard publicUrl={publicUrl} />
    </div>
  );
}
