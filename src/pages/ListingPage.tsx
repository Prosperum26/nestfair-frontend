import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { messageForListingError } from '@/features/listing/errors.ts';
import { useListing } from '@/features/listing/hooks.ts';
import { ListingForm } from '@/features/listing/components/ListingForm.tsx';
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

/** Tin tìm bạn ở ghép (ảnh 20): trưởng phòng soạn và đăng tin, thành viên thường chỉ xem. */
export function ListingPage() {
  const { house } = useCurrentHouse();
  const listing = useListing(house?.id);
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
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ListingForm
              key={listing.data.listing?.id ?? 'new'}
              houseId={house.id}
              data={listing.data}
              canEdit={canEdit}
              // F4: photosSlot={<PhotoGroups ... />}
            />
          </div>
          {/* F5, F6: cột phải (lg:col-span-5) chứa poster xem trước và link công khai. */}
        </div>
      )}
    </>
  );
}
