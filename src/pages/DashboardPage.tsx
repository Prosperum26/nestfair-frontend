import {
  ArrowRight,
  Bell,
  CalendarDays,
  Dice5,
  ListChecks,
  Plus,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { ActivityList, ActivityPanel } from '@/features/activity/components/ActivityList.tsx';
import { LiveTicker } from '@/features/activity/components/LiveTicker.tsx';
import { useActivityFeed } from '@/features/activity/hooks.ts';
import { TodayCard } from '@/features/chores/components/TodayCard.tsx';
import { CardEmpty, DashCard } from '@/features/dashboard/DashCard.tsx';
import { SwapSummaryWidget } from '@/features/swaps/components/SwapSummaryWidget.tsx';
import { WheelPreview } from '@/features/wheel/components/WheelPreview.tsx';
import { useWheelStore } from '@/features/wheel/store.ts';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import type { HouseMember } from '@/features/houses/types.ts';
import { cn } from '@/lib/cn.ts';
import { firstName, formatDayOverline, greeting, monthOverline } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/*
 * Tổng quan (preview 05). Các thẻ thuộc module chưa làm (Chi tiêu, Việc nhà, Đổi ca, Trợ lý)
 * đang là chỗ trống có tiêu đề đúng thiết kế; module nào xong thì thay phần ruột thẻ của mình.
 * Thứ tự trên mobile theo preview 05 mobile (dùng order-*), desktop là lưới 12 cột 5/7 · 7/5 · 7/5.
 */

const linkCls = 'text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]';

/** Thẻ số dư tối (Card tối, Design.md mục 3). Chưa có chi tiêu thì 0đ. */
function BalanceCard({ month }: { month: string }) {
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-card bg-ink p-5 sm:p-6">
      <GridPaper />
      <div className="relative flex flex-1 flex-col">
        <p className="font-mono text-over uppercase text-ink-on2">Số dư của bạn · {month}</p>
        <p className="mt-5 text-sm text-ink-on2">Chưa có khoản chi nào</p>
        <p className="mt-1 font-mono text-[44px] leading-[52px] font-bold tracking-[-1.5px] text-hl">
          {formatVnd(0)}
        </p>
        <p className="mt-3 text-sm text-ink-on2">
          Thêm khoản chi đầu tiên, NestFair sẽ tính ai cần trả ai.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 lg:mt-auto lg:pt-6">
          <Button variant="accent" leftIcon={<QrCode />} disabled>
            Trả bằng VietQR
          </Button>
          <Button variant="onInk" disabled>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Hàng nút nhanh mobile (Design.md mục 5): Thêm chi · Quét HĐ · Vòng quay · Trợ lý. */
function QuickActions() {
  const openWheel = useWheelStore((s) => s.openModal);
  const items: { to?: string; onClick?: () => void; label: string; icon: ReactNode }[] = [
    { to: '/expenses', label: 'Thêm chi', icon: <Plus /> },
    { to: '/expenses', label: 'Quét HĐ', icon: <ScanLine /> },
    { onClick: openWheel, label: 'Vòng quay', icon: <Dice5 /> },
    { to: '/assistant', label: 'Trợ lý', icon: <Sparkles /> },
  ];
  const tile = (icon: ReactNode) => (
    <span className="flex h-14 w-full items-center justify-center rounded-card border border-line bg-surface [&_svg]:size-6">{icon}</span>
  );
  return (
    <nav aria-label="Thao tác nhanh" className="grid grid-cols-4 gap-2.5 lg:hidden">
      {items.map(({ to, onClick, label, icon }) =>
        to ? (
          <Link key={label} to={to} className="flex flex-col items-center gap-1.5 text-cap text-ink">
            {tile(icon)}
            {label}
          </Link>
        ) : (
          <button key={label} type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 text-cap text-ink">
            {tile(icon)}
            {label}
          </button>
        ),
      )}
    </nav>
  );
}

/** Bảng công bằng: trục 0 ở giữa, ai cũng 0đ cho tới khi có chi tiêu. */
function FairnessCard({ members, month }: { members: HouseMember[] | undefined; month: string }) {
  return (
    <DashCard
      overline="Số dư ròng sau 0 hóa đơn"
      title="Bảng công bằng"
      aside={<Chip tone="outline" icon={<CalendarDays />}>{month.replace('THÁNG', 'Tháng')}</Chip>}
    >
      <div className="flex justify-between text-cap text-ink-2" aria-hidden>
        <span>← Cần trả</span>
        <span>Được nhận →</span>
      </div>
      <ul className="mt-3 mb-5 flex flex-col gap-3">
        {members
          ? members.map((m) => (
              <li key={m.userId} className="flex items-center gap-3">
                <Avatar name={m.fullName} tone={avatarToneFor(m.userId)} src={m.avatarUrl} size={28} />
                <span className="w-16 truncate text-sm font-medium text-ink sm:w-20">{firstName(m.fullName)}</span>
                <span className="relative h-2.5 flex-1 rounded-full bg-paper-2" aria-hidden>
                  <span className="absolute inset-y-[-3px] left-1/2 border-l border-dashed border-line-2" />
                </span>
                <span className="w-20 text-right font-mono text-mm text-ink-2 sm:w-24">{formatVnd(0)}</span>
              </li>
            ))
          : [0, 1, 2].map((i) => <Skeleton key={i} className="h-7" />)}
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm text-ink-2">
        <span>
          Tổng chi <span className="font-mono">{formatVnd(0)}</span>
        </span>
        <Link to="/expenses" className={linkCls}>
          Mở sổ chi
        </Link>
      </div>
    </DashCard>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { house } = useCurrentHouse();
  const detail = useHouseDetail(house?.id);
  const navigate = useNavigate();
  const now = new Date();
  const month = monthOverline(now);
  const members = detail.data?.members;
  const feed = useActivityFeed(house?.id);
  const [historyOpen, setHistoryOpen] = useState(false);
  const openWheel = useWheelStore((s) => s.openModal);

  return (
    <>
      <PageHeader
        overline={formatDayOverline(now)}
        title={`${greeting(now)}, ${user ? firstName(user.fullName) : 'bạn'}.`}
        description={
          house
            ? `${house.name} có ${house.memberCount} thành viên. Việc nhà và chi tiêu sẽ hiện ở đây khi các phần đó hoàn thành.`
            : undefined
        }
        actions={
          <div className="hidden gap-3 lg:flex">
            <Button variant="secondary" leftIcon={<ListChecks />} onClick={() => navigate('/chores')}>
              Thêm việc
            </Button>
            <Button variant="accent" leftIcon={<Plus />} onClick={() => navigate('/expenses')}>
              Thêm chi tiêu
            </Button>
          </div>
        }
      />

      <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="order-2 lg:order-none lg:col-span-12">
          <LiveTicker
            items={feed.data}
            status={feed.status}
            members={members}
            me={user?.id}
            onRetry={() => void feed.refetch()}
            onOpen={() => setHistoryOpen(true)}
          />
        </div>
        <div className="order-3 lg:hidden">
          <QuickActions />
        </div>

        <div className="order-1 lg:order-none lg:col-span-5">
          <BalanceCard month={month} />
        </div>
        <div className="order-7 flex lg:order-none lg:col-span-7 [&>section]:flex-1">
          <FairnessCard members={members} month={month} />
        </div>

        <TodayCard className="order-4 lg:order-none lg:col-span-7" houseId={house?.id} meUserId={user?.id} />
        <DashCard className="order-8 lg:order-none lg:col-span-5" overline="Việc phát sinh" title="Vòng quay may mắn">
          <WheelPreview members={members} onSpin={openWheel} />
        </DashCard>

        <DashCard
          className="order-9 lg:order-none lg:col-span-7"
          title="Hoạt động gần đây"
          aside={
            feed.data?.length ? (
              <button type="button" className={linkCls} onClick={() => setHistoryOpen(true)}>
                Xem tất cả
              </button>
            ) : undefined
          }
        >
          <ActivityList items={feed.data} status={feed.status} me={user?.id} onRetry={() => void feed.refetch()} limit={5} />
        </DashCard>
        <div className="order-5 flex flex-col gap-4 lg:order-none lg:col-span-5 lg:gap-6">
          <SwapSummaryWidget houseId={house?.id} />
          <DashCard
            overline="3 nhắc gần nhất"
            title="Nhắc nhở"
            aside={
              <Link to="/assistant" className={cn(linkCls, 'flex items-center gap-1')}>
                Mở trợ lý <ArrowRight className="size-4" aria-hidden />
              </Link>
            }
          >
            <CardEmpty icon={<Bell />}>Nhờ Trợ lý tạo nhắc nhở, 3 nhắc gần nhất sẽ hiện ở đây.</CardEmpty>
          </DashCard>
        </div>
      </div>
      <ActivityPanel houseId={house?.id} open={historyOpen} onClose={() => setHistoryOpen(false)} me={user?.id} />
    </>
  );
}
