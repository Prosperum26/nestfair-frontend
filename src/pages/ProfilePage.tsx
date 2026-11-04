import { ChevronRight, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { useLogout } from '@/features/auth/hooks.ts';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { BankSection } from '@/features/profile/components/BankSection.tsx';
import { MyHousesSection } from '@/features/profile/components/MyHousesSection.tsx';
import { NotificationsSection } from '@/features/profile/components/NotificationsSection.tsx';
import { PersonalInfoSection } from '@/features/profile/components/PersonalInfoSection.tsx';
import { ProfileSummaryCard } from '@/features/profile/components/ProfileSummaryCard.tsx';
import { SecuritySection } from '@/features/profile/components/SecuritySection.tsx';
import { PROFILE_SECTIONS, PROFILE_TABS, type ProfileTab } from '@/features/profile/sections.ts';
import { cn } from '@/lib/cn.ts';
import { usePageTitle } from '@/lib/use-page-title.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/**
 * Hồ sơ & tài khoản nhận tiền (preview 12_Ho_So). Desktop: thẻ tóm tắt + điều hướng bên trái, các mục xếp dọc.
 * Mobile: thanh tab chọn một nhóm mục.
 */
export function ProfilePage() {
  usePageTitle('Hồ sơ');
  const user = useAuthStore((s) => s.user);
  const { house } = useCurrentHouse();
  const logout = useLogout();
  const [tab, setTab] = useState<ProfileTab>('info');
  const [activeId, setActiveId] = useState(PROFILE_SECTIONS[0].id);
  if (!user) return null;

  const wrap = (group: ProfileTab, node: React.ReactNode) => <div className={cn(tab !== group && 'hidden lg:block')}>{node}</div>;

  const goTo = (id: string) => {
    setActiveId(id);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <>
      <PageHeader
        overline="Tài khoản"
        title="Hồ sơ của bạn"
        actions={
          <Button variant="secondary" leftIcon={<LogOut />} loading={logout.isPending} onClick={() => logout.mutate()}>
            Đăng xuất
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
          <ProfileSummaryCard user={user} house={house} />
          <nav aria-label="Các mục hồ sơ" className="hidden rounded-card border border-line bg-surface p-2 lg:block">
            {PROFILE_SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-current={activeId === id ? 'true' : undefined}
                onClick={() => goTo(id)}
                className={cn(
                  'flex h-11 w-full items-center gap-3 rounded-btn px-3 text-left text-sm focus-visible:outline-none focus-visible:shadow-focus',
                  activeId === id ? 'bg-hl-soft font-semibold text-ink' : 'text-ink-2 hover:bg-paper',
                )}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                <ChevronRight className="size-4 shrink-0 text-ink-3" aria-hidden />
              </button>
            ))}
          </nav>
          <SegmentedControl className="lg:hidden" label="Nhóm thông tin hồ sơ" options={PROFILE_TABS} value={tab} onChange={setTab} />
        </aside>

        <div className="flex min-w-0 flex-col gap-6">
          {wrap('info', <PersonalInfoSection user={user} />)}
          {wrap('bank', <BankSection user={user} />)}
          {wrap('notifications', <NotificationsSection user={user} />)}
          {wrap('security', <SecuritySection />)}
          {wrap('info', <MyHousesSection currentHouseId={house?.id ?? null} />)}
        </div>
      </div>
    </>
  );
}
