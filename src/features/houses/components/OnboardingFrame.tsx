import { Check, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { useLogout } from '@/features/auth/hooks.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

const STEPS = ['Tài khoản', 'Chọn nhà', 'Bắt đầu'];

/** Thanh bước 1-2-3 (preview 04). Mobile chỉ hiện nhãn của bước hiện tại. */
function Stepper({ current }: { current: 2 | 3 }) {
  return (
    <ol className="flex items-center gap-3 sm:gap-6" aria-label={`Bước ${current} trên 3`}>
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex items-center gap-2" aria-current={active ? 'step' : undefined}>
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full font-mono text-[12px] font-bold',
                done && 'bg-ink text-hl',
                active && 'border-[1.5px] border-ink bg-hl text-ink',
                !done && !active && 'border-[1.5px] border-line-2 bg-surface text-ink',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={3} aria-label="Đã xong" /> : step}
            </span>
            <span
              className={cn(
                'text-sm',
                active ? 'font-semibold text-ink' : 'hidden text-ink-2 sm:inline',
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Khung chung các bước onboarding: top bar (logo · stepper · user) + nền giấy kẻ ô. */
export function OnboardingFrame({ step, children }: { step: 2 | 3; children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="relative min-h-svh bg-paper">
      <GridPaper tone="paper" />
      <header className="relative mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-4 lg:h-[72px] lg:px-6">
        <Link to="/" aria-label="NestFair">
          <Logo className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
        </Link>
        <Stepper current={step} />
        <div className="hidden items-center gap-4 md:flex">
          {user && (
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <Avatar name={user.fullName} tone={avatarToneFor(user.id)} src={user.avatarUrl} size={32} />
              {firstName(user.fullName)}
            </span>
          )}
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="flex items-center gap-1.5 text-btns text-ink hover:underline [&_svg]:size-4"
          >
            <LogOut aria-hidden />
            Đăng xuất
          </button>
        </div>
      </header>
      <main className="relative mx-auto max-w-[1000px] px-4 pt-6 pb-16 lg:pt-12">{children}</main>
    </div>
  );
}
