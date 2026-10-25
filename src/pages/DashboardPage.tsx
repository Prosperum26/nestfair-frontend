import {
  ArrowLeftRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Dice5,
  History,
  ListChecks,
  Plus,
  QrCode,
  ScanLine,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { CardEmpty, DashCard } from '@/features/dashboard/DashCard.tsx';
import { useCurrentHouse, useHouseDetail } from '@/features/houses/hooks.ts';
import type { HouseMember } from '@/features/houses/types.ts';
import { cn } from '@/lib/cn.ts';
import { firstName, formatDayOverline, formatDayShort, greeting, monthOverline } from '@/lib/date.ts';
import { formatSignedVnd, formatVnd } from '@/lib/format.ts';
import { useExpenseSummary, useSettlementPlan } from '@/features/expenses/hooks.ts';
import { monthKeyOf } from '@/features/expenses/month.ts';
import { useLedgerRealtime } from '@/features/expenses/realtime.ts';
import { myPosition } from '@/features/settlements/plan-view.ts';
import type { PlanMember, SettlementPlan } from '@/features/settlements/types.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/*
 * Tổng quan (preview 05). Các thẻ thuộc module chưa làm (Chi tiêu, Việc nhà, Đổi ca, Trợ lý)
 * đang là chỗ trống có tiêu đề đúng thiết kế; module nào xong thì thay phần ruột thẻ của mình.
 * Thứ tự trên mobile theo preview 05 mobile (dùng order-*), desktop là lưới 12 cột 5/7 · 7/5 · 7/5.
 */

const linkCls = 'text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]';

/** Thẻ số dư tối (Card tối, Design.md mục 3): số dư ròng của bạn theo kế hoạch thanh toán. */
function BalanceCard({ month, plan, meId }: { month: string; plan: SettlementPlan | undefined; meId: string | undefined }) {
  const navigate = useNavigate();
  const pos = plan ? myPosition(plan, meId) : null;
  const nameOf = (id: string) => firstName(plan?.members.find((m) => m.id === id)?.fullName ?? '');
  const owe = !!pos && pos.net < 0;
  const label = !pos ? 'Đang tải…' : pos.net < 0 ? 'Bạn cần trả' : pos.net > 0 ? 'Bạn được nhận' : 'Đã sòng phẳng';
  const detail = !pos
    ? ''
    : owe
      ? `cho ${pos.toPay.map((t) => nameOf(t.toUserId)).join(', ')} · ${pos.toPay.length} giao dịch`
      : pos.net > 0
        ? `từ ${pos.toReceive.map((t) => nameOf(t.fromUserId)).join(', ')}`
        : 'Không nợ ai, cũng không ai nợ bạn.';
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-card bg-ink p-5 sm:p-6">
      <GridPaper />
      <div className="relative flex flex-1 flex-col">
        <p className="font-mono text-over uppercase text-ink-on2">Số dư của bạn · {month}</p>
        <p className="mt-5 text-sm text-ink-on2">{label}</p>
        {pos ? (
          <p className="mt-1 font-mono text-[44px] leading-[52px] font-bold tracking-[-1.5px] text-hl">{formatVnd(Math.abs(pos.net))}</p>
        ) : (
          <Skeleton className="mt-2 h-12 w-48 bg-ink-soft" />
        )}
        <p className="mt-3 text-sm text-ink-on2">{detail}</p>
        <div className="mt-6 flex flex-wrap gap-3 lg:mt-auto lg:pt-6">
          <Button variant="accent" leftIcon={<QrCode />} disabled={!owe} onClick={() => navigate('/payments')}>
            Trả bằng VietQR
          </Button>
          <Button variant="onInk" disabled={!plan} onClick={() => navigate('/payments')}>
            Xem chi tiết
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Dải "TRỰC TIẾP": chấm đỏ + avatar cả nhà; sự kiện realtime sẽ chạy ngang ở đây (Socket.IO). */
function LiveTicker({ members }: { members: HouseMember[] | undefined }) {
  return (
    <div className="flex h-11 items-center gap-3 overflow-hidden rounded-[14px] bg-ink px-4 lg:h-[52px]">
      <span className="flex shrink-0 items-center gap-2">
        <span className="size-2 rounded-full bg-tom-v" aria-hidden />
        <span className="font-mono text-over uppercase text-hl">Trực tiếp</span>
      </span>
      <span className="hidden shrink-0 -space-x-1.5 sm:flex">
        {members?.map((m) => (
          <Avatar
            key={m.userId}
            name={m.fullName}
            tone={avatarToneFor(m.userId)}
            src={m.avatarUrl}
            size={24}
            className="ring-2 ring-ink"
          />
        ))}
      </span>
      <span className="hidden h-5 w-px shrink-0 bg-ink-line sm:block" aria-hidden />
      <p className="truncate text-sm text-ink-on2">Hoạt động của cả nhà sẽ chạy ở đây theo thời gian thực.</p>
    </div>
  );
}

/** Hàng nút nhanh mobile (Design.md mục 5): Thêm chi · Quét HĐ · Vòng quay · Trợ lý. */
function QuickActions() {
  const items: { to: string; label: string; icon: ReactNode }[] = [
    { to: '/expenses?new=1', label: 'Thêm chi', icon: <Plus /> },
    { to: '/expenses/scan', label: 'Quét HĐ', icon: <ScanLine /> },
    { to: '/chores', label: 'Vòng quay', icon: <Dice5 /> },
    { to: '/assistant', label: 'Trợ lý', icon: <Sparkles /> },
  ];
  return (
    <nav aria-label="Thao tác nhanh" className="grid grid-cols-4 gap-2.5 lg:hidden">
      {items.map(({ to, label, icon }) => (
        <Link key={label} to={to} className="flex flex-col items-center gap-1.5 text-cap text-ink">
          <span className="flex h-14 w-full items-center justify-center rounded-card border border-line bg-surface [&_svg]:size-6">
            {icon}
          </span>
          {label}
        </Link>
      ))}
    </nav>
  );
}

/**
 * Bảng công bằng (Design.md mục 4, Fairness chart): thanh phân kỳ quanh trục 0, dương mint-v sang phải
 * (được nhận), âm tom-v sang trái (cần trả). Số dư lấy từ kế hoạch thanh toán (cộng dồn mọi tháng).
 */
function FairnessCard({
  members,
  month,
  totalAmount,
  expenseCount,
}: {
  members: PlanMember[] | undefined;
  month: string;
  totalAmount: number | undefined;
  expenseCount: number | undefined;
}) {
  const max = Math.max(1, ...(members ?? []).map((m) => Math.abs(m.net)));
  return (
    <DashCard
      overline={`Số dư ròng · ${expenseCount ?? 0} hóa đơn tháng này`}
      title="Bảng công bằng"
      aside={<Chip tone="outline" icon={<CalendarDays />}>{month.replace('THÁNG', 'Tháng')}</Chip>}
    >
      <div className="flex justify-between text-cap text-ink-2" aria-hidden>
        <span>← Cần trả</span>
        <span>Được nhận →</span>
      </div>
      <ul className="mt-3 mb-5 flex flex-col gap-3">
        {members
          ? members.map((m) => {
              const width = `${(Math.abs(m.net) / max) * 50}%`;
              return (
                <li key={m.id} className="flex items-center gap-3">
                  <Avatar name={m.fullName} tone={avatarToneFor(m.id)} src={m.avatarUrl} size={28} />
                  <span className="w-16 truncate text-sm font-medium text-ink sm:w-20">{firstName(m.fullName)}</span>
                  <span className="relative h-2.5 flex-1 rounded-full bg-paper-2" aria-hidden>
                    <span className="absolute inset-y-[-3px] left-1/2 border-l border-dashed border-line-2" />
                    {m.net !== 0 && (
                      <span
                        className={cn('absolute inset-y-[-2px] rounded-[4px]', m.net > 0 ? 'left-1/2 bg-mint-v' : 'right-1/2 bg-tom-v')}
                        style={{ width }}
                      />
                    )}
                  </span>
                  <span className={cn('w-24 text-right font-mono text-mm sm:w-28', m.net > 0 ? 'text-mint' : m.net < 0 ? 'text-tom' : 'text-ink-2')}>
                    {formatSignedVnd(m.net)}
                  </span>
                </li>
              );
            })
          : [0, 1, 2].map((i) => <Skeleton key={i} className="h-7" />)}
      </ul>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-4 text-sm text-ink-2">
        <span>
          Tổng chi tháng <span className="font-mono">{formatVnd(totalAmount ?? 0)}</span>
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
  const plan = useSettlementPlan(house?.id);
  const summary = useExpenseSummary(house?.id, monthKeyOf(now));
  useLedgerRealtime(house?.id);

  return (
    <>
      <PageHeader
        overline={formatDayOverline(now)}
        title={`${greeting(now)}, ${user ? firstName(user.fullName) : 'bạn'}.`}
        description={
          house
            ? `${house.name} có ${house.memberCount} thành viên.`
            : undefined
        }
        actions={
          <div className="hidden gap-3 lg:flex">
            <Button variant="secondary" leftIcon={<ListChecks />} onClick={() => navigate('/chores')}>
              Thêm việc
            </Button>
            <Button variant="accent" leftIcon={<Plus />} onClick={() => navigate('/expenses?new=1')}>
              Thêm chi tiêu
            </Button>
          </div>
        }
      />

      <div className="mt-6 flex flex-col gap-4 lg:mt-8 lg:grid lg:grid-cols-12 lg:gap-6">
        <div className="order-2 lg:order-none lg:col-span-12">
          <LiveTicker members={members} />
        </div>
        <div className="order-3 lg:hidden">
          <QuickActions />
        </div>

        <div className="order-1 lg:order-none lg:col-span-5">
          <BalanceCard month={month} plan={plan.data} meId={user?.id} />
        </div>
        <div className="order-7 flex lg:order-none lg:col-span-7 [&>section]:flex-1">
          <FairnessCard members={plan.data?.members} month={month} totalAmount={summary.data?.totalAmount} expenseCount={summary.data?.expenseCount} />
        </div>

        <DashCard
          className="order-4 lg:order-none lg:col-span-7"
          overline={formatDayShort(now)}
          title="Việc hôm nay"
          aside={<Chip tone="outline">0 việc</Chip>}
        >
          <CardEmpty icon={<ListChecks />}>
            Chưa có lịch trực. Trưởng phòng tạo danh sách việc nhà để NestFair xếp lịch xoay vòng công bằng.{' '}
            <Link to="/chores" className={linkCls}>
              Mở Việc nhà
            </Link>
          </CardEmpty>
        </DashCard>
        <DashCard className="order-8 lg:order-none lg:col-span-5" overline="Việc phát sinh" title="Vòng quay may mắn">
          <CardEmpty icon={<Dice5 />}>
            Có việc đột xuất chưa ai nhận? Quay để chọn người công bằng, cả nhà cùng xem.
          </CardEmpty>
        </DashCard>

        <DashCard
          className="order-9 lg:order-none lg:col-span-7"
          title="Hoạt động gần đây"
        >
          <CardEmpty icon={<History />}>Chi tiêu, check-in việc nhà và đổi ca của cả nhà sẽ hiện ở đây.</CardEmpty>
        </DashCard>
        <div className="order-5 flex flex-col gap-4 lg:order-none lg:col-span-5 lg:gap-6">
          <DashCard overline="Yêu cầu · Chợ ca · Nợ ca" title="Đổi ca">
            <CardEmpty icon={<ArrowLeftRight />}>Yêu cầu nhờ trực dùm và ca trên Chợ ca sẽ hiện ở đây.</CardEmpty>
          </DashCard>
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
    </>
  );
}
