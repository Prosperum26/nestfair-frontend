import { Plus, RotateCw, TriangleAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { MemberActions } from '@/features/membership/components/MemberActions.tsx';
import { RulesCard } from '@/features/houses/components/RulesCard.tsx';
import { InvitePanel } from '@/features/houses/components/InvitePanel.tsx';
import { MemberCard, MemberRow } from '@/features/houses/components/MemberCard.tsx';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { inviteLink } from '@/features/houses/invite-code.ts';
import { copyText } from '@/lib/clipboard.ts';
import { daysLeft } from '@/lib/date.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

function MembersSkeleton() {
  return (
    <div className="mt-8 flex flex-col gap-6" aria-busy="true" aria-label="Đang tải thành viên">
      <Skeleton className="h-[160px] rounded-card" />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[300px] rounded-card" />
        ))}
      </div>
    </div>
  );
}

/** Thành viên & mã mời (preview 11). */
export function MembersPage() {
  const { house: current } = useCurrentHouse();
  const detail = useHouseDetail(current?.id);
  const me = useAuthStore((s) => s.user);
  const month = new Date().getMonth() + 1;

  if (detail.isPending) {
    return (
      <>
        <PageHeader overline={current?.name} title="Thành viên" />
        <MembersSkeleton />
      </>
    );
  }
  if (detail.isError) {
    return (
      <>
        <PageHeader overline={current?.name} title="Thành viên" />
        <div className="mt-8 rounded-card border border-line bg-surface">
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Không tải được danh sách thành viên"
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

  const house = detail.data;
  // Bạn đứng đầu, sau đó theo thứ tự vào nhà.
  const members = [...house.members].sort(
    (a, b) => Number(b.userId === me?.id) - Number(a.userId === me?.id),
  );
  // Trưởng phòng thấy menu trên thẻ của người khác (không phải trưởng phòng).
  const actionsFor = (m: (typeof house.members)[number]) =>
    house.myRole === 'ADMIN' && m.userId !== me?.id && m.role !== 'ADMIN' ? <MemberActions house={house} member={m} /> : undefined;
  const canInvite = daysLeft(house.inviteExpiresAt) > 0 && house.members.length < house.maxMembers;

  return (
    <>
      <PageHeader
        overline={[house.name, house.address].filter(Boolean).join(' · ')}
        title="Thành viên"
        actions={
          <>
            <Chip tone="outline" size="md" icon={<Users />} className="h-11 px-3.5 font-mono">
              {house.members.length} / {house.maxMembers} người
            </Chip>
            <Button
              variant="accent"
              leftIcon={<Plus />}
              disabled={!canInvite}
              onClick={() => void copyText(inviteLink(house.inviteCode), 'Đã sao chép link mời. Gửi cho bạn cùng phòng nhé.')}
            >
              Mời thêm bạn
            </Button>
          </>
        }
      />

      <div className="mt-8 flex flex-col gap-6">
        <InvitePanel house={house} />

        <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
          {members.map((m) => (
            <MemberCard key={m.userId} member={m} isMe={m.userId === me?.id} month={month} actions={actionsFor(m)} />
          ))}
        </div>

        <ul className="divide-y divide-line rounded-card border border-line bg-surface px-4 md:hidden">
          {members.map((m) => (
            <MemberRow key={m.userId} member={m} isMe={m.userId === me?.id} actions={actionsFor(m)} />
          ))}
        </ul>

        <RulesCard house={house} meId={me?.id} />
      </div>
    </>
  );
}
