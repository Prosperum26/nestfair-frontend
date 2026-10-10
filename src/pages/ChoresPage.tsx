import { CalendarDays, ChevronLeft, ChevronRight, RotateCw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { KanbanBoard } from '@/features/chores/components/KanbanBoard.tsx';
import { WeeklyCalendar } from '@/features/chores/components/WeeklyCalendar.tsx';
import { useAssignments, useChores } from '@/features/chores/hooks.ts';
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

  const chores = useChores(house?.id);
  const assignments = useAssignments(house?.id, weekKey);
  const memberCount = detail.data?.members.length ?? house?.memberCount;

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
      <PageHeader overline={weekRangeLabel(weekKey)} title="Việc nhà" description={description} />

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
          <EmptyState
            icon={<CalendarDays />}
            tone="yellow"
            title="Tuần này chưa có lịch trực"
            description="Lịch tuần mới được tạo tự động vào Chủ Nhật. Trưởng phòng cũng có thể xếp lịch ngay."
          />
        </div>
      ) : (
        <div className="mt-6">
          {view === 'calendar' ? (
            <WeeklyCalendar assignments={assignments.data} weekKey={weekKey} meUserId={me?.id} />
          ) : (
            <KanbanBoard assignments={assignments.data} meUserId={me?.id} />
          )}
        </div>
      )}
    </>
  );
}
