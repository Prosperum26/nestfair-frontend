import { ListChecks, RotateCw, TriangleAlert } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { HouseInfoSection } from '@/features/houses/components/HouseInfoSection.tsx';
import { InvitePanel } from '@/features/houses/components/InvitePanel.tsx';
import { PendingProposalsSection } from '@/features/houses/components/PendingProposalsSection.tsx';
import { RulesSection } from '@/features/houses/components/RulesSection.tsx';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { LeaveHouseSection, TransferAdminSection } from '@/features/membership/components/HouseRoleSections.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Cài đặt nhà (chỉ trưởng phòng): thông tin, mã mời, nội quy. Việc nhà nằm ở /settings. */
export function HouseManagePage() {
  const navigate = useNavigate();
  const { house: current, isPending: housesPending } = useCurrentHouse();
  const detail = useHouseDetail(current?.id);
  const meId = useAuthStore((s) => s.user?.id);

  // Thành viên thường không vào được trang này.
  if (current && current.myRole !== 'ADMIN') return <Navigate to="/dashboard" replace />;

  const header = (
    <PageHeader
      overline={current?.name}
      title="Cài đặt nhà"
      description="Thông tin nhà, mã mời, nội quy và quyền trưởng phòng. Chỉ trưởng phòng thấy trang này."
      actions={
        <Button variant="secondary" leftIcon={<ListChecks />} onClick={() => navigate('/settings')}>
          Cài đặt việc nhà
        </Button>
      }
    />
  );

  if (housesPending || detail.isPending) {
    return (
      <>
        {header}
        <div className="mt-8 flex flex-col gap-6" aria-busy="true" aria-label="Đang tải cài đặt nhà">
          <Skeleton className="h-[160px] rounded-card" />
          <Skeleton className="h-[280px] rounded-card" />
          <Skeleton className="h-[320px] rounded-card" />
        </div>
      </>
    );
  }
  if (detail.isError) {
    return (
      <>
        {header}
        <div className="mt-8 rounded-card border border-line bg-surface">
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
      </>
    );
  }

  return (
    <>
      {header}
      <div className="mt-8 flex flex-col gap-6">
        <InvitePanel house={detail.data} />
        <HouseInfoSection house={detail.data} />
        <RulesSection house={detail.data} />
        <PendingProposalsSection houseId={detail.data.id} />
        {meId && <TransferAdminSection house={detail.data} meId={meId} />}
        {meId && <LeaveHouseSection house={detail.data} meId={meId} />}
      </div>
    </>
  );
}
