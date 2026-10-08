import { LayoutDashboard } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { firstName, formatDayOverline, greeting } from '@/lib/date.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

// H6: tiêu đề thật + chỗ trống. H7 dựng lưới thẻ theo preview 05.
export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { house } = useCurrentHouse();
  const now = new Date();

  return (
    <>
      <PageHeader
        overline={formatDayOverline(now)}
        title={`${greeting(now)}, ${user ? firstName(user.fullName) : 'bạn'}.`}
        description={house ? `${house.name} · ${house.memberCount}/${house.maxMembers} thành viên` : undefined}
      />
      <div className="mt-8 rounded-card border border-line bg-surface">
        <EmptyState
          icon={<LayoutDashboard />}
          tone="yellow"
          title="Tổng quan đang được dựng"
          description="Số dư, việc hôm nay, đổi ca và nhắc nhở sẽ hiện ở đây."
        />
      </div>
    </>
  );
}
