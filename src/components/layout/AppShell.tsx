import { Bell, Plus } from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { IconButton } from '@/components/ui/IconButton.tsx';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { ConnectionDot, ReconnectBanner } from '@/features/realtime/ConnectionIndicator.tsx';
import { RealtimeProvider } from '@/features/realtime/RealtimeProvider.tsx';
import { WheelModal } from '@/features/wheel/components/WheelModal.tsx';
import { useWheelRealtime } from '@/features/wheel/hooks.ts';
import { Logo } from '@/components/ui/Logo.tsx';
import { useReminderRealtime } from '@/features/reminders/realtime.ts';
import { cn } from '@/lib/cn.ts';
import { HouseSwitcher } from './HouseSwitcher.tsx';
import { NAV_ITEMS, PAGE_TITLES, TAB_ITEMS } from './nav.ts';
import { UserMenu } from './UserMenu.tsx';

const notificationsSoon = () => toast('Thông báo sẽ có khi các tính năng việc nhà, chi tiêu hoàn thành.');

/** Top nav desktop h72 (Design.md mục 5): logo · menu · house switcher · chuông · avatar. */
function TopNav() {
  return (
    <header className="sticky top-0 z-40 hidden h-[72px] border-b border-line bg-surface lg:block">
      <div className="mx-auto flex h-full max-w-page items-center gap-4 px-6 xl:px-0">
        <NavLink to="/dashboard" aria-label="NestFair - Tổng quan" className="shrink-0">
          <Logo />
        </NavLink>
        <nav aria-label="Điều hướng chính" className="min-w-0 flex-1">
          <ul className="flex items-center gap-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  title={label}
                  className={({ isActive }) =>
                    cn(
                      'flex h-10 items-center gap-2 rounded-btn-sm px-2.5 text-sm whitespace-nowrap focus-visible:outline-none focus-visible:shadow-focus',
                      isActive ? 'bg-hl-soft font-semibold text-ink' : 'font-medium text-ink-2 hover:bg-paper hover:text-ink',
                    )
                  }
                >
                  <Icon className="size-[18px] shrink-0" aria-hidden />
                  {/* lg (1024): chỉ icon để vừa 7 mục; xl trở lên có chữ. */}
                  <span className="sr-only xl:not-sr-only xl:whitespace-nowrap">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex shrink-0 items-center gap-3">
          <HouseSwitcher />
          <IconButton icon={<Bell />} label="Thông báo" onClick={notificationsSoon} />
          {/* Chấm kết nối gắn ở góc avatar: không thêm bề rộng vào hàng, menu 7 mục vẫn đủ chỗ ở xl. */}
          <div className="relative">
            <UserMenu />
            <ConnectionDot className="pointer-events-none absolute top-[26px] left-[26px]" />
          </div>
        </div>
      </div>
    </header>
  );
}

/** Top bar mobile h64: avatar 40 · nhà đang xem (overline) + tiêu đề trang · chuông. */
function MobileTopBar() {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'NestFair';
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
      <UserMenu compact />
      <div className="min-w-0 flex-1">
        <HouseSwitcher compact />
        <p className="truncate font-display text-ct text-ink">{title}</p>
      </div>
      <ConnectionDot />
      <IconButton icon={<Bell />} label="Thông báo" onClick={notificationsSoon} />
    </header>
  );
}

/** Tab bar mobile: 4 tab + FAB giữa (52×52, r16, nền hl, viền ink, bóng 3/3). */
function TabBar() {
  const navigate = useNavigate();
  const tab = ({ to, label, icon: Icon }: (typeof TAB_ITEMS)[number]) => (
    <NavLink
      key={to}
      to={to}
      className="group flex flex-1 flex-col items-center gap-1 pt-2 text-cap text-ink-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink"
    >
      <span className="flex h-[30px] w-[52px] items-center justify-center rounded-full group-aria-[current=page]:bg-hl-soft">
        <Icon className="size-[22px]" aria-hidden />
      </span>
      {label}
    </NavLink>
  );
  return (
    <nav
      aria-label="Điều hướng chính"
      className="fixed inset-x-0 bottom-0 z-40 flex items-start border-t border-line bg-surface pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
    >
      {TAB_ITEMS.slice(0, 2).map(tab)}
      <div className="flex flex-1 justify-center">
        <button
          type="button"
          aria-label="Thêm chi tiêu"
          onClick={() => navigate('/expenses?new=1')}
          className="-mt-5 flex size-[52px] items-center justify-center rounded-[16px] border-[1.5px] border-ink bg-hl text-ink shadow-hard active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
        >
          <Plus className="size-6" aria-hidden />
        </button>
      </div>
      {TAB_ITEMS.slice(2).map(tab)}
    </nav>
  );
}

/** Khung các màn trong nhà: top nav (desktop) hoặc top bar + tab bar (mobile). Một kết nối realtime cho nhà đang xem. */
/** Đồng bộ vòng quay cho cả app (cần nằm trong RealtimeProvider). */
function WheelSync({ houseId }: { houseId: string | undefined }) {
  useWheelRealtime(houseId);
  return <WheelModal houseId={houseId} />;
}

export function AppShell() {
  const { house } = useCurrentHouse();
  // Chỉ được mount khi đã đăng nhập (ProtectedRoute → RequireHouse): nghe nhắc việc đến hạn một lần cho cả app.
  useReminderRealtime();
  return (
    <RealtimeProvider houseId={house?.id}>
      <div className="min-h-svh bg-paper">
        <TopNav />
        <MobileTopBar />
        <ReconnectBanner />
        <main className="mx-auto max-w-page px-4 pt-6 pb-32 lg:px-6 lg:pt-10 lg:pb-24 xl:px-0">
          <Outlet />
        </main>
        <TabBar />
      </div>
      <WheelSync houseId={house?.id} />
    </RealtimeProvider>
  );
}
