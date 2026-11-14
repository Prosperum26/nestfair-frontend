import { Logo } from '@/components/ui/Logo.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';

/**
 * Khung app đang tải (thay màn trắng chỉ có spinner): cùng kích thước top nav / top bar / tab bar với AppShell
 * nên khi nhà tải xong, layout không nhảy.
 */
export function ShellSkeleton({ label }: { label: string }) {
  return (
    <div className="min-h-svh bg-paper" role="status">
      <span className="sr-only">{label}</span>
      <header className="sticky top-0 z-40 hidden h-[72px] border-b border-line bg-surface lg:block" aria-hidden>
        <div className="mx-auto flex h-full max-w-page items-center gap-4 px-6 xl:px-0">
          <Logo />
          <div className="flex flex-1 gap-2">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-10 xl:w-24" />
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </header>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden" aria-hidden>
        <Skeleton className="h-6 w-32" />
        <span className="flex-1" />
        <Skeleton className="size-10 rounded-full" />
      </header>
      <main className="mx-auto flex max-w-page flex-col gap-4 px-4 pt-6 pb-32 lg:px-6 lg:pt-10 lg:pb-24 xl:px-0" aria-hidden>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 flex h-[72px] items-center justify-around border-t border-line bg-surface lg:hidden" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-[30px] w-[52px] rounded-full" />
        ))}
      </div>
    </div>
  );
}
