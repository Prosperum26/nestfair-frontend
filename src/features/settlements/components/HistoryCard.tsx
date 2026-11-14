import { CircleCheck, Clock, History, ImageIcon, TriangleAlert, X } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { Stamp } from '@/components/ui/Stamp.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import type { UserBrief } from '@/features/expenses/types.ts';
import { dayMonth } from '@/features/expenses/grouping.ts';
import { cn } from '@/lib/cn.ts';
import { firstName, formatDate } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import type { Settlement, SettlementStatus } from '../types.ts';

const STATUS_CHIP: Record<SettlementStatus, { label: string; tone: 'mint' | 'yellow' | 'neutral'; icon: typeof Clock }> = {
  CONFIRMED: { label: 'Đã nhận', tone: 'mint', icon: CircleCheck },
  PENDING: { label: 'Chờ xác nhận', tone: 'yellow', icon: Clock },
  CANCELLED: { label: 'Đã hủy', tone: 'neutral', icon: X },
};

function Who({ user, meId }: { user: UserBrief; meId: string | undefined }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Avatar name={user.fullName} tone={avatarToneFor(user.id)} src={user.avatarUrl} size={20} />
      <span className="truncate">{user.id === meId ? 'Bạn' : firstName(user.fullName)}</span>
    </span>
  );
}

function Evidence({ s }: { s: Settlement }) {
  if (!s.proofUrl) return <span className="text-ink-3">–</span>;
  return (
    <a href={s.proofUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-ink-2 underline decoration-line-2 underline-offset-2 hover:text-ink">
      <ImageIcon className="size-3.5" aria-hidden />
      Xem bill
    </a>
  );
}

function StatusChip({ status }: { status: SettlementStatus }) {
  const meta = STATUS_CHIP[status];
  const Icon = meta.icon;
  return (
    <Chip tone={meta.tone} size="sm" icon={<Icon />}>
      {meta.label}
    </Chip>
  );
}

/** "Lịch sử tất toán" (ảnh 09): bảng desktop, danh sách mobile, con dấu ĐÃ NHẬN của lần xác nhận gần nhất. */
export function HistoryCard({
  items,
  isPending,
  isError,
  onRetry,
  scope,
  onScopeChange,
  meId,
}: {
  items: Settlement[] | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  scope: 'all' | 'mine';
  onScopeChange: (s: 'all' | 'mine') => void;
  meId: string | undefined;
}) {
  const latestConfirmed = items?.find((s) => s.status === 'CONFIRMED');
  const th = 'px-3 text-left font-mono text-over font-medium uppercase text-ink-2';

  return (
    <section className="relative rounded-card border border-line bg-surface p-4 sm:p-6">
      {latestConfirmed?.confirmedAt && (
        <Stamp label="ĐÃ NHẬN" date={formatDate(new Date(latestConfirmed.confirmedAt))} tone="mint" rotate={-8} className="pointer-events-none absolute -top-10 right-40 hidden lg:block" />
      )}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Lịch sử tất toán</h2>
        <SegmentedControl
          label="Lọc lịch sử"
          options={[
            { value: 'all', label: 'Tất cả' },
            { value: 'mine', label: 'Của bạn' },
          ]}
          value={scope}
          onChange={onScopeChange}
          className="w-[180px]"
        />
      </header>

      <div className="mt-4">
        {isPending ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Đang tải lịch sử">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Chưa tải được lịch sử"
            action={
              <Button variant="secondary" onClick={onRetry}>
                Thử lại
              </Button>
            }
          />
        ) : !items?.length ? (
          <EmptyState icon={<History />} title="Chưa có giao dịch nào" description="Khi có người báo đã chuyển tiền, giao dịch sẽ hiện ở đây." />
        ) : (
          <>
            <table className="hidden w-full border-separate border-spacing-0 text-sm lg:table">
              <thead>
                <tr className="h-10 bg-paper-2">
                  <th className={cn(th, 'w-[88px] rounded-l-btn-sm')}>Ngày</th>
                  <th className={th}>Giao dịch</th>
                  <th className={cn(th, 'w-[140px] text-right')}>Số tiền</th>
                  <th className={cn(th, 'w-[160px]')}>Bằng chứng</th>
                  <th className={cn(th, 'w-[150px] rounded-r-btn-sm')}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((s) => (
                    <AnimatedItem as="tr" key={s.id} className="h-[60px] [&>td]:border-b [&>td]:border-line">
                      <td className="px-3 font-mono text-ms text-ink">{dayMonth(s.createdAt)}</td>
                      <td className="px-3 text-ink">
                        <span className="flex items-center gap-2">
                          <Who user={s.from} meId={meId} />
                          <span className="text-ink-2" aria-label="trả cho">
                            →
                          </span>
                          <Who user={s.to} meId={meId} />
                        </span>
                      </td>
                      <td className="px-3 text-right font-mono text-mm text-ink">{formatVnd(s.amount)}</td>
                      <td className="px-3">
                        <Evidence s={s} />
                      </td>
                      <td className="px-3">
                        <StatusChip status={s.status} />
                      </td>
                    </AnimatedItem>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            <ul className="divide-y divide-line lg:hidden">
              <AnimatePresence initial={false}>
                {items.map((s) => (
                  <AnimatedItem as="li" key={s.id} className="flex items-center gap-3 py-3">
                    <Avatar name={s.from.fullName} tone={avatarToneFor(s.from.id)} src={s.from.avatarUrl} size={32} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">
                        {s.from.id === meId ? 'Bạn' : firstName(s.from.fullName)} → {s.to.id === meId ? 'Bạn' : firstName(s.to.fullName)}
                      </p>
                      <p className="text-cap text-ink-2">
                        {dayMonth(s.createdAt)} · {s.proofUrl ? 'Có bill' : 'Chuyển khoản'}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="font-mono text-mm text-ink">{formatVnd(s.amount)}</span>
                      <StatusChip status={s.status} />
                    </div>
                  </AnimatedItem>
                ))}
              </AnimatePresence>
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
