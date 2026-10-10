import { Camera, CalendarDays, ChevronLeft, ChevronRight, Eye, ListChecks, Plus, RotateCw, Shuffle, TriangleAlert } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { AssignmentCard } from '@/features/chores/components/AssignmentCard.tsx';
import { CheckinModal } from '@/features/chores/components/CheckinModal.tsx';
import { ChoreFormModal } from '@/features/chores/components/ChoreFormModal.tsx';
import { KanbanBoard } from '@/features/chores/components/KanbanBoard.tsx';
import { ShuffleDialog } from '@/features/chores/components/ShuffleDialog.tsx';
import { VerifyModal } from '@/features/chores/components/VerifyModal.tsx';
import { WeeklyCalendar } from '@/features/chores/components/WeeklyCalendar.tsx';
import { useAssignments, useChores } from '@/features/chores/hooks.ts';
import { canCheckin, canVerify } from '@/features/chores/permissions.ts';
import type { Assignment } from '@/features/chores/types.ts';
import { type ChoresView, readView, writeView } from '@/features/chores/view-preference.ts';
import { shiftWeek, weekKeyOf, weekRangeLabel } from '@/features/chores/week.ts';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

const VIEW_OPTIONS: { value: ChoresView; label: string }[] = [
  { value: 'calendar', label: 'Lịch tuần' },
  { value: 'kanban', label: 'Kanban' },
];

function ChoresSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Đang tải lịch trực">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[132px] rounded-card" />
      ))}
    </div>
  );
}

/** Việc nhà (preview 06 / 16): lịch trực theo tuần, xem dạng Lịch tuần hoặc Kanban. */
export function ChoresPage() {
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const me = useAuthStore((s) => s.user);
  const thisWeek = weekKeyOf(new Date());
  const [weekKey, setWeekKey] = useState(thisWeek);
  const [view, setView] = useState<ChoresView>(readView);
  const [choreFormOpen, setChoreFormOpen] = useState(false);
  const [shuffleOpen, setShuffleOpen] = useState(false);
  const [checkinTarget, setCheckinTarget] = useState<Assignment | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Assignment | null>(null);

  const chores = useChores(house?.id);
  const assignments = useAssignments(house?.id, weekKey);
  const memberCount = detail.data?.members.length ?? house?.memberCount;
  const isAdmin = house?.myRole === 'ADMIN';
  // Không xếp lại lịch của tuần đã qua (backend cũng từ chối).
  const canShuffle = isAdmin && weekKey >= thisWeek;

  /** Nút hành động trên thẻ ca: người làm check-in, người khác xem & duyệt. */
  const renderActions = (a: Assignment): ReactNode => {
    if (canCheckin(a, me?.id)) {
      return (
        <Button size="sm" leftIcon={<Camera />} onClick={() => setCheckinTarget(a)}>
          {a.status === 'REJECTED' ? 'Làm lại' : 'Check-in'}
        </Button>
      );
    }
    if (canVerify(a, me?.id)) {
      return (
        <Button size="sm" leftIcon={<Eye />} onClick={() => setVerifyTarget(a)}>
          Xem và duyệt
        </Button>
      );
    }
    return null;
  };
  const selectAssignment = (a: Assignment) => {
    if (canCheckin(a, me?.id)) setCheckinTarget(a);
    else if (canVerify(a, me?.id)) setVerifyTarget(a);
  };
  const waitingForMe = (assignments.data ?? []).filter((a) => canVerify(a, me?.id));

  const changeView = (next: ChoresView) => {
    setView(next);
    writeView(next);
  };

  const description =
    chores.data && memberCount
      ? `${chores.data.length} việc định kỳ · xoay vòng ${memberCount} người · rào 3 tuần`
      : undefined;

  return (
    <>
      <PageHeader
        overline={weekRangeLabel(weekKey)}
        title="Việc nhà"
        description={description}
        actions={
          isAdmin && (
            <>
              <Button variant="secondary" leftIcon={<Shuffle />} disabled={!canShuffle} onClick={() => setShuffleOpen(true)}>
                Random xếp lịch tuần
              </Button>
              <Button variant="accent" leftIcon={<Plus />} onClick={() => setChoreFormOpen(true)}>
                Việc mới
              </Button>
            </>
          )
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SegmentedControl
          label="Kiểu xem"
          options={VIEW_OPTIONS}
          value={view}
          onChange={changeView}
          className="w-full sm:w-[260px]"
        />
        <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between sm:ml-auto">
          <IconButton icon={<ChevronLeft />} label="Tuần trước" onClick={() => setWeekKey(shiftWeek(weekKey, -1))} />
          <Button variant="secondary" disabled={weekKey === thisWeek} onClick={() => setWeekKey(thisWeek)}>
            Tuần này
          </Button>
          <IconButton icon={<ChevronRight />} label="Tuần sau" onClick={() => setWeekKey(shiftWeek(weekKey, 1))} />
        </div>
      </div>

      {assignments.isPending ? (
        <ChoresSkeleton />
      ) : assignments.isError ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Không tải được lịch trực"
            description={assignments.error.message}
            action={
              <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void assignments.refetch()}>
                Thử lại
              </Button>
            }
          />
        </div>
      ) : assignments.data.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          {chores.data?.length === 0 ? (
            <EmptyState
              icon={<ListChecks />}
              tone="yellow"
              title="Chưa có việc nào"
              description={
                isAdmin
                  ? 'Thêm các việc định kỳ của nhà, rồi xếp lịch xoay vòng cho cả nhà.'
                  : 'Trưởng phòng chưa thêm việc nào cho nhà.'
              }
              action={
                isAdmin && (
                  <Button variant="accent" leftIcon={<Plus />} onClick={() => setChoreFormOpen(true)}>
                    Thêm việc đầu tiên
                  </Button>
                )
              }
            />
          ) : (
            <EmptyState
              icon={<CalendarDays />}
              tone="yellow"
              title="Tuần này chưa có lịch trực"
              description="Lịch tuần mới được tạo tự động vào Chủ Nhật. Trưởng phòng cũng có thể xếp lịch ngay."
              action={
                canShuffle && (
                  <Button variant="accent" leftIcon={<Shuffle />} onClick={() => setShuffleOpen(true)}>
                    Xếp lịch tuần này
                  </Button>
                )
              }
            />
          )}
        </div>
      ) : (
        <div className="mt-6">
          {view === 'calendar' ? (
            <WeeklyCalendar
              assignments={assignments.data}
              weekKey={weekKey}
              meUserId={me?.id}
              onSelect={selectAssignment}
              renderActions={renderActions}
            />
          ) : (
            <KanbanBoard assignments={assignments.data} meUserId={me?.id} renderActions={renderActions} />
          )}
        </div>
      )}
      {waitingForMe.length > 0 && (
        <section aria-label="Chờ bạn duyệt" className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-display text-ct text-ink">Chờ bạn duyệt</h2>
            <span className="font-mono text-cap text-ink-2">{waitingForMe.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {waitingForMe.map((a) => (
              <AssignmentCard key={a.id} assignment={a} actions={renderActions(a)} />
            ))}
          </div>
        </section>
      )}

      {house && (
        <>
          <ChoreFormModal open={choreFormOpen} onClose={() => setChoreFormOpen(false)} houseId={house.id} />
          <ShuffleDialog open={shuffleOpen} onClose={() => setShuffleOpen(false)} houseId={house.id} weekKey={weekKey} />
          <CheckinModal assignment={checkinTarget} houseId={house.id} onClose={() => setCheckinTarget(null)} />
          <VerifyModal assignment={verifyTarget} houseId={house.id} meUserId={me?.id} onClose={() => setVerifyTarget(null)} />
        </>
      )}
    </>
  );
}
