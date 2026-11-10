import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Reveal } from '@/components/ui/Reveal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { messageForListingError } from '@/features/listing/errors.ts';
import { useListing } from '@/features/listing/hooks.ts';
import { useListingRealtime } from '@/features/listing/realtime.ts';
import { ListingForm } from '@/features/listing/components/ListingForm.tsx';
import { PhotoGroups } from '@/features/listing/components/PhotoGroups.tsx';
import { ListingStatusBar } from '@/features/listing/components/ListingStatusBar.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';

function ListingSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-6" aria-busy="true" aria-label="Đang tải tin đăng">
      <Skeleton className="h-[260px] rounded-card" />
      <Skeleton className="h-[300px] rounded-card" />
      <Skeleton className="h-[220px] rounded-card" />
    </div>
  );
}

/** Chưa có tin thì chưa có chỗ gắn ảnh (backend trả LISTING_NOT_FOUND): nhắc lưu nháp trước. */
function PhotosNeedDraft() {
  return (
    <section aria-labelledby="listing-photos-title" className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <p className="font-mono text-over uppercase text-ink-2">Mỗi nhóm cần ít nhất 1 ảnh</p>
      <h2 id="listing-photos-title" className="font-display text-ct text-ink">
        Ảnh theo nhóm
      </h2>
      <p className="mt-2 text-sm text-ink-2">Bấm Lưu nháp ở cuối trang trước, rồi thêm ảnh Phòng ngủ, Phòng vệ sinh và Gian sinh hoạt.</p>
    </section>
  );
}

/** Tin tìm bạn ở ghép (ảnh 20): trưởng phòng soạn và đăng tin, thành viên thường chỉ xem. */
export function ListingPage() {
  const { house } = useCurrentHouse();
  const listing = useListing(house?.id);
  useListingRealtime(house?.id);
  const canEdit = house?.myRole === 'ADMIN';

  return (
    <>
      <PageHeader
        overline={`${house?.name ?? 'Nhà'} · Tìm người ở ghép`}
        title="Tin tìm bạn ở ghép"
        description="Đã đủ người thì tin tự đóng và trang công khai hiện “Đã đủ người”."
        actions={house && <ListingStatusBar houseId={house.id} listing={listing.data?.listing ?? null} canEdit={canEdit} />}
      />
      {!house || listing.isPending ? (
        <ListingSkeleton />
      ) : listing.isError ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Chưa tải được tin đăng"
            description={messageForListingError(listing.error)}
            action={
              <Button variant="secondary" loading={listing.isFetching} onClick={() => void listing.refetch()}>
                Thử lại
              </Button>
            }
          />
        </div>
      ) : (
        <Reveal className="mt-6">
          <ListingForm
            key={listing.data.listing?.id ?? 'new'}
            houseId={house.id}
            data={listing.data}
            canEdit={canEdit}
            photosSlot={
              listing.data.listing ? (
                <PhotoGroups houseId={house.id} photos={listing.data.listing.photos} canEdit={canEdit} />
              ) : (
                <PhotosNeedDraft />
              )
            }
          />
        </Reveal>
      )}
    </>
  );
}
