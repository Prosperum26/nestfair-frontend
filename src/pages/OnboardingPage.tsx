import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { Logo } from '@/components/ui/Logo.tsx';
import { useLogout } from '@/features/auth/hooks.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

// Placeholder: tạo nhà / nhập mã mời làm ở phần sau của issue.
export function OnboardingPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <div className="min-h-svh bg-paper">
      <header className="flex h-16 items-center justify-between border-b border-line bg-surface px-4 lg:h-[72px] lg:px-10">
        <Logo />
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<LogOut />}
          loading={logout.isPending}
          onClick={() => logout.mutate()}
        >
          Đăng xuất
        </Button>
      </header>
      <main className="mx-auto max-w-page px-4 pt-10 lg:px-6">
        <p className="font-mono text-over uppercase text-ink-2">Bắt đầu</p>
        <h1 className="mt-2 font-display text-h1m text-ink lg:text-h1">
          Chào {user?.fullName.split(' ').at(-1)}.
        </h1>
        <p className="mt-2 text-sm text-ink-2">
          Bạn đã đăng nhập bằng {user?.email}. Tạo nhà hoặc nhập mã mời sẽ có ở bước tiếp theo.
        </p>
      </main>
    </div>
  );
}
