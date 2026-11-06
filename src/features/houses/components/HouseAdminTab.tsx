import { RotateCw, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { DissolveHouseSection, LeaveHouseSection, TransferAdminSection } from '@/features/membership/components/HouseRoleSections.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';
import { useCurrentHouse, useHouseDetail } from '../hooks.ts';
import { HouseInfoSection } from './HouseInfoSection.tsx';
import { InvitePanel } from './InvitePanel.tsx';
import { PendingProposalsSection } from './PendingProposalsSection.tsx';
import { RulesSection } from './RulesSection.tsx';

/** Nội dung tab "Nhà" (chỉ trưởng phòng): thông tin, mã mời, nội quy, đề xuất, chuyển quyền, rời và giải tán. */
export function HouseAdminTab() {
  const { house: current, isPending: housesPending } = useCurrentHouse();
  const detail = useHouseDetail(current?.id);
  const meId = useAuthStore((s) => s.user?.id);

  if (housesPending || detail.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải cài đặt nhà">
        <Skeleton className="h-[160px] rounded-card" />
        <Skeleton className="h-[280px] rounded-card" />
        <Skeleton className="h-[320px] rounded-card" />
      </div>
    );
  }
  if (detail.isError) {
    return (
      <div className="rounded-card border border-line bg-surface">
        <EmptyState
          icon={<TriangleAlert />}
          tone="tom"
          title="Không tải được cài đặt nhà"
          description={detail.error.message}
          action={
            <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void detail.refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <InvitePanel house={detail.data} />
      <HouseInfoSection house={detail.data} />
      <RulesSection house={detail.data} />
      <PendingProposalsSection houseId={detail.data.id} />
      {meId && <TransferAdminSection house={detail.data} meId={meId} />}
      {meId && <LeaveHouseSection house={detail.data} meId={meId} />}
      <DissolveHouseSection house={detail.data} />
    </div>
  );
}
