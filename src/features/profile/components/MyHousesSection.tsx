import { Crown, Home, LogOut, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { useMyHouses } from '@/features/houses/hooks.ts';
import { ROLE_LABELS } from '@/features/houses/types.ts';
import { LeaveHouseDialog } from '@/features/membership/components/LeaveHouseDialog.tsx';
import { useAuthStore } from '@/stores/auth-store.ts';
import { useHouseStore } from '@/stores/house-store.ts';
import { ProfileSection } from './ProfileSection.tsx';

/** Các nhà bạn đang ở, vai trò và nút chuyển nhà đang xem. */
export function MyHousesSection({ currentHouseId }: { currentHouseId: string | null }) {
  const houses = useMyHouses();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  const meId = useAuthStore((s) => s.user?.id);
  const [leaving, setLeaving] = useState<{ id: string; name: string } | null>(null);

  return (
    <ProfileSection id="profile-houses" title="Nhà của tôi">
      {houses.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải danh sách nhà">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : houses.isError ? (
        <EmptyState
          icon={<Home />}
          tone="tom"
          title="Chưa tải được danh sách nhà"
          description="Kiểm tra mạng rồi thử lại."
          action={<Button variant="secondary" onClick={() => void houses.refetch()}>Thử lại</Button>}
        />
      ) : houses.data.length === 0 ? (
        <EmptyState
          icon={<Home />}
          title="Bạn chưa ở nhà nào"
          description="Tạo nhà mới hoặc vào nhà bằng mã mời."
          action={<Link to="/onboarding" className="text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]">Bắt đầu</Link>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {houses.data.map((h) => {
            const current = h.id === currentHouseId;
            return (
              <li key={h.id} className="flex flex-wrap items-center gap-3 rounded-btn border border-line px-4 py-3">
                <div className="min-w-0 flex-1 basis-full sm:basis-0">
                  <p className="truncate text-sm font-semibold text-ink">{h.name}</p>
                  <p className="mt-0.5 text-cap text-ink-2">
                    {h.memberCount}/{h.maxMembers} thành viên
                  </p>
                </div>
                <Chip tone={h.myRole === 'ADMIN' ? 'ink' : 'neutral'} icon={h.myRole === 'ADMIN' ? <Crown /> : <UserRound />}>
                  {ROLE_LABELS[h.myRole]}
                </Chip>
                {current ? (
                  <Chip tone="mint">Đang xem</Chip>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => selectHouse(h.id)}>
                    Xem nhà này
                  </Button>
                )}
                <Button size="sm" variant="ghost" leftIcon={<LogOut />} onClick={() => setLeaving({ id: h.id, name: h.name })}>
                  Rời nhà
                </Button>
              </li>
            );
          })}
        </ul>
      )}
      {leaving && meId && <LeaveHouseDialog houseId={leaving.id} houseName={leaving.name} meId={meId} onClose={() => setLeaving(null)} />}
    </ProfileSection>
  );
}
