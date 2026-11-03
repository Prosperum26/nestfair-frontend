import { Megaphone, WifiOff } from 'lucide-react';
import { useParams } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { listingHeadline } from '@/features/listing/format.ts';
import { usePublicListing } from '@/features/listing/hooks.ts';
import { publicViewState } from '@/features/listing/public-state.ts';
import { ListingUnavailable } from '@/features/listing/public/ListingUnavailable.tsx';
import { PublicListingView } from '@/features/listing/public/PublicListingView.tsx';
import { usePublicMeta } from '@/features/listing/public/usePublicMeta.ts';

function PublicSkeleton() {
  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6 px-4 pt-6 lg:pt-10" aria-busy="true" aria-label="Đang tải tin">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-4/5 max-w-[420px]" />
        <Skeleton className="h-5 w-3/5 max-w-[320px]" />
      </div>
      <Skeleton className="h-[148px] rounded-card" />
      <Skeleton className="h-[260px] rounded-card" />
    </div>
  );
}

/** Trang công khai /r/:slug, nằm ngoài ProtectedRoute và AppShell: khách chưa đăng nhập xem được. */
export function PublicListingPage() {
  const { slug } = useParams();
  const query = usePublicListing(slug);
  const state = publicViewState({ isLoading: query.isLoading, error: query.error, data: query.data });
  const data = query.data;

  usePublicMeta(data?.status === 'OPEN' ? `${listingHeadline(data.summary.slotsOpen)} · NestFair` : 'Tin tìm bạn ở ghép · NestFair');

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between gap-3 px-4">
          <a href="/" aria-label="NestFair">
            <Logo size="sm" />
          </a>
          <Chip tone="outline" size="sm" icon={<Megaphone aria-hidden />}>
            Tin tìm bạn ở ghép
          </Chip>
        </div>
      </header>
      <main>
        {state === 'loading' && <PublicSkeleton />}
        {state === 'error' && (
          <div className="mx-auto mt-10 max-w-[560px] px-4">
            <div className="rounded-card border border-line bg-surface">
              <EmptyState
                icon={<WifiOff />}
                tone="tom"
                title="Chưa tải được tin"
                description="Kết nối đang gián đoạn. Bạn kiểm tra mạng rồi thử lại nhé."
                action={
                  <Button variant="secondary" loading={query.isFetching} onClick={() => void query.refetch()}>
                    Thử lại
                  </Button>
                }
              />
            </div>
          </div>
        )}
        {(state === 'notfound' || state === 'full' || state === 'closed') && (
          <div className="mx-auto mt-10 max-w-[560px] px-4">
            <ListingUnavailable kind={state} locationText={data?.status === 'CLOSED' ? data.locationText : undefined} />
          </div>
        )}
        {state === 'open' && data?.status === 'OPEN' && <PublicListingView listing={data} />}
      </main>
    </div>
  );
}
