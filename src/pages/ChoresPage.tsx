import { Ban, Camera, CalendarDays, Dice5, ChevronLeft, ChevronRight, Eye, ListChecks, Plus, RefreshCw, RotateCw, Settings, ShieldCheck, TriangleAlert } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { AppealButton } from '@/features/chores/components/AppealButton.tsx';
import { AssignmentCard } from '@/features/chores/components/AssignmentCard.tsx';
import { CheckinModal } from '@/features/chores/components/CheckinModal.tsx';
import { KanbanBoard } from '@/features/chores/components/KanbanBoard.tsx';
import { OverrideModal } from '@/features/chores/components/OverrideModal.tsx';
import { ScheduleBanner } from '@/features/chores/components/ScheduleBanner.tsx';
import { TodayPanel } from '@/features/chores/components/TodayPanel.tsx';
import { ShuffleControls } from '@/features/chores/components/ShuffleControls.tsx';
import { VerifyModal } from '@/features/chores/components/VerifyModal.tsx';
import { WeeklyCalendar } from '@/features/chores/components/WeeklyCalendar.tsx';
import { messageForError } from '@/features/chores/errors.ts';
import { mergeAssignments, waitingForReview } from '@/features/chores/grouping.ts';
import { useChoreSettings, useChores, useTodayAssignments, useWeekView } from '@/features/chores/hooks.ts';
import { canAppeal, canCheckin, canVerify, overrideActions } from '@/features/chores/permissions.ts';
import { reasonsFor } from '@/features/chores/reasons.ts';
import { useChoresRealtime } from '@/features/chores/realtime.ts';
import { shuffleState } from '@/features/chores/shuffle-state.ts';
import type { Assignment } from '@/features/chores/types.ts';
import { type ChoresView, readView, writeView } from '@/features/chores/view-preference.ts';
import { shiftWeek, weekKeyOf, weekRangeLabel } from '@/features/chores/week.ts';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import { VoidSpinModal } from '@/features/wheel/components/VoidSpinModal.tsx';
import { useWheelStore } from '@/features/wheel/store.ts';
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
  const navigate = useNavigate();
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const me = useAuthStore((s) => s.user);
  const thisWeek = weekKeyOf(new Date());
  const [weekKey, setWeekKey] = useState(thisWeek);
  const [view, setView] = useState<ChoresView>(readView);
  const [checkinTarget, setCheckinTarget] = useState<Assignment | null>(null);
  const [verifyTarget, setVerifyTarget] = useState<Assignment | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<Assignment | null>(null);
  const [voidTarget, setVoidTarget] = useState<Assignment | null>(null);
  const openWheel = useWheelStore((s) => s.openModal);

  const week = useWeekView(house?.id, weekKey);
  const today = useTodayAssignments(house?.id);
  const chores = useChores(house?.id);
  const settings = useChoreSettings(house?.id);
  const modalOpen = !!(checkinTarget || verifyTarget || overrideTarget || voidTarget);
  const { stale, refresh } = useChoresRealtime(house?.id, modalOpen);

  const isAdmin = house?.myRole === 'ADMIN';
  const graceHours = settings.data?.choreGraceHours ?? 3;
  const memberCount = detail.data?.members.length ?? house?.memberCount;
  const schedule = week.data?.schedule ?? null;
  const assignments = week.data?.assignments ?? [];
  const inRange = weekKey === thisWeek || weekKey === shiftWeek(thisWeek, 1);
  const hasActivity = assignments.some((a) => !['TODO', 'UNASSIGNED', 'CANCELLED'].includes(a.status));
  const shuffle = shuffleState({ schedule, isAdmin, inRange, hasActivity });

  const closeModals = () => {
    setCheckinTarget(null);
    setVerifyTarget(null);
    setOverrideTarget(null);
    setVoidTarget(null);
    // Có thay đổi từ người khác trong lúc đang mở modal: tải lại ngay khi đóng.
    if (stale) refresh();
  };
  const changeView = (next: ChoresView) => {
    setView(next);
    writeView(next);
  };

  const who = { isAdmin, meUserId: me?.id };
  /** Nút hành động trên thẻ ca: người làm check-in, người khác xem & duyệt, khiếu nại, trưởng phòng can thiệp. */
  const renderActions = (a: Assignment): ReactNode => {
    const nodes: ReactNode[] = [];
    if (canCheckin(a, me?.id, new Date(), graceHours)) {
      nodes.push(
        <Button key="checkin" size="sm" leftIcon={<Camera />} onClick={() => setCheckinTarget(a)}>
          {a.status === 'REJECTED' ? 'Làm lại' : 'Check-in'}
        </Button>,
      );
    } else if (canVerify(a, me?.id)) {
      nodes.push(
        <Button key="verify" size="sm" leftIcon={<Eye />} onClick={() => setVerifyTarget(a)}>
          Xem và duyệt
        </Button>,
      );
    }
    if (house && canAppeal(a, me?.id)) nodes.push(<AppealButton key="appeal" houseId={house.id} assignment={a} />);
    if (isAdmin && a.source === 'WHEEL' && a.wheelSpinId && a.status === 'TODO' && !a.submittedAt) {
      nodes.push(
        <Button key="void" size="sm" variant="ghost" leftIcon={<Ban />} onClick={() => setVoidTarget(a)}>
          Hủy vòng quay
        </Button>,
      );
    }
    if (overrideActions(a, who).length > 0) {
      nodes.push(
        <Button key="override" size="sm" variant="ghost" leftIcon={<ShieldCheck />} onClick={() => setOverrideTarget(a)}>
          Can thiệp
        </Button>,
      );
    }
    return nodes.length > 0 ? nodes : null;
  };
  const selectAssignment = (a: Assignment) => {
    if (canCheckin(a, me?.id, new Date(), graceHours)) setCheckinTarget(a);
    else if (canVerify(a, me?.id)) setVerifyTarget(a);
    else if (overrideActions(a, who).length > 0) setOverrideTarget(a);
  };
  // Gồm ca vòng quay đã nộp (kể cả ca còn mở từ tuần trước): duyệt như ca thường.
  const waitingForMe = waitingForReview(mergeAssignments(assignments, today.assignments), me?.id);

  const showToday = view === 'calendar' && weekKey === thisWeek && assignments.length > 0;
  const waitingSection =
    waitingForMe.length > 0 ? (
      <section aria-label="Chờ bạn duyệt" className={showToday ? 'rounded-card border border-line bg-surface p-5' : undefined}>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-display text-ct text-ink">Chờ bạn duyệt</h2>
          <span className="font-mono text-cap text-ink-2">{waitingForMe.length}</span>
        </div>
        <div className={showToday ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'}>
          {waitingForMe.map((a) => (
            <AssignmentCard key={a.id} assignment={a} actions={renderActions(a)} />
          ))}
        </div>
      </section>
    ) : null;

  const description =
    chores.data && memberCount
      ? `${chores.data.length} việc định kỳ · xoay vòng ${memberCount} người · rào ${schedule?.fenceWeeksApplied ?? Math.min(3, memberCount)} tuần`
      : undefined;

  return (
    <>
      <PageHeader
        overline={weekRangeLabel(weekKey)}
        title="Việc nhà"
        description={description}
        actions={
          house && (
            <>
              <ShuffleControls
                houseId={house.id}
                weekKey={weekKey}
                schedule={schedule}
                isAdmin={isAdmin}
                inRange={inRange}
                hasActivity={hasActivity}
              />
              <Button variant="secondary" leftIcon={<Dice5 />} onClick={openWheel}>
                Vòng quay
              </Button>
              <Button variant={shuffle.kind === 'CREATE' ? 'secondary' : 'accent'} leftIcon={<Settings />} onClick={() => navigate('/settings')}>
                Cài đặt việc nhà
              </Button>
            </>
          )
        }
      />

      {stale && (
        <div role="status" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-card border border-line-2 bg-paper-2 px-4 py-3 text-sm text-ink">
          <span>Trạng thái ca đã thay đổi.</span>
          <Button size="sm" variant="secondary" leftIcon={<RefreshCw />} onClick={refresh}>
            Tải lại
          </Button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <SegmentedControl label="Kiểu xem" options={VIEW_OPTIONS} value={view} onChange={changeView} className="w-full sm:w-[260px]" />
        <div className="flex items-center gap-2 max-sm:w-full max-sm:justify-between sm:ml-auto">
          <IconButton icon={<ChevronLeft />} label="Tuần trước" onClick={() => setWeekKey(shiftWeek(weekKey, -1))} />
          <Button variant="secondary" disabled={weekKey === thisWeek} onClick={() => setWeekKey(thisWeek)}>
            Tuần này
          </Button>
          <IconButton icon={<ChevronRight />} label="Tuần sau" onClick={() => setWeekKey(shiftWeek(weekKey, 1))} />
        </div>
      </div>

      {schedule && schedule.status !== 'EMPTY' && (
        <div className="mt-4">
          <ScheduleBanner schedule={schedule} />
        </div>
      )}

      {week.isPending ? (
        <ChoresSkeleton />
      ) : week.isError ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Không tải được lịch trực"
            description={messageForError(week.error)}
            action={
              <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void week.refetch()}>
                Thử lại
              </Button>
            }
          />
        </div>
      ) : assignments.length === 0 ? (
        <div className="mt-6 rounded-card border border-line bg-surface">
          {!schedule ? (
            <EmptyState
              icon={<CalendarDays />}
              tone="yellow"
              title="Chưa có lịch cho tuần này"
              description="Lịch chỉ được tạo cho tuần này và tuần sau."
            />
          ) : chores.data?.length === 0 ? (
            <EmptyState
              icon={<ListChecks />}
              tone="yellow"
              title="Chưa có việc nào"
              description={isAdmin ? 'Thêm các việc định kỳ của nhà, rồi tạo lịch xoay vòng cho cả nhà.' : 'Trưởng phòng chưa thêm việc nào cho nhà.'}
              action={
                isAdmin && (
                  <Button variant="accent" leftIcon={<Plus />} onClick={() => navigate('/settings')}>
                    Thêm việc đầu tiên
                  </Button>
                )
              }
            />
          ) : (
            <EmptyState
              icon={<CalendarDays />}
              tone="yellow"
              title="Tuần này chưa có ca nào"
              description={reasonsFor(schedule)[0] ?? 'Dùng nút Tạo lịch tuần này ở trên để xếp lịch.'}
            />
          )}
        </div>
      ) : (
        <div className="mt-6">
          {view === 'calendar' ? (
            <div className="flex flex-col gap-6">
              <WeeklyCalendar assignments={assignments} weekKey={weekKey} meUserId={me?.id} onSelect={selectAssignment} renderActions={renderActions} />
              {showToday && house && (
                <div className="order-first grid items-start gap-6 md:order-last md:grid-cols-2">
                  <TodayPanel assignments={today.assignments} houseId={house.id} meUserId={me?.id} graceHours={graceHours} />
                  {waitingSection}
                </div>
              )}
            </div>
          ) : (
            <KanbanBoard assignments={assignments} meUserId={me?.id} renderActions={renderActions} />
          )}
        </div>
      )}

      {!showToday && waitingSection && <div className="mt-8">{waitingSection}</div>}

      {house && (
        <>
          <CheckinModal assignment={checkinTarget} houseId={house.id} meUserId={me?.id} onClose={closeModals} />
          <VerifyModal assignment={verifyTarget} houseId={house.id} meUserId={me?.id} onClose={closeModals} />
          <OverrideModal assignment={overrideTarget} houseId={house.id} meUserId={me?.id} onClose={closeModals} />
          <VoidSpinModal
            assignment={voidTarget}
            onClose={closeModals}
            onDone={() => {
              closeModals();
              refresh();
            }}
          />
        </>
      )}
    </>
  );
}
