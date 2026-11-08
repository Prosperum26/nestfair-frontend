import { CircleCheck, QrCode, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { PageHeader } from '@/components/ui/PageHeader.tsx';
import { Reveal } from '@/components/ui/Reveal.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { useSettlementHistory, useSettlementPlan } from '@/features/expenses/hooks.ts';
import { monthKeyOf, monthNumber, monthOverlineOf, shiftMonth } from '@/features/expenses/month.ts';
import { useLedgerRealtime } from '@/features/expenses/realtime.ts';
import { DebtSimplifyCard } from '@/features/settlements/components/DebtSimplifyCard.tsx';
import { HistoryCard } from '@/features/settlements/components/HistoryCard.tsx';
import { MyAccountCard, ReceiveQrModal } from '@/features/settlements/components/MyAccount.tsx';
import { SettleList } from '@/features/settlements/components/SettleList.tsx';
import { VietQrModal } from '@/features/settlements/components/VietQrModal.tsx';
import { myPosition } from '@/features/settlements/plan-view.ts';
import type { PlanTransfer, SettlementPlan } from '@/features/settlements/types.ts';
import { useCurrentHouse } from '@/features/houses/hooks.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

/** Thẻ tối đầu trang mobile (ảnh 09 mobile): bạn cần trả / được nhận bao nhiêu, nút trả nhanh. */
function MyBalanceCard({ plan, meId, onPay }: { plan: SettlementPlan; meId: string | undefined; onPay: (t: PlanTransfer) => void }) {
  const pos = myPosition(plan, meId);
  const nameOf = (id: string) => firstName(plan.members.find((m) => m.id === id)?.fullName ?? '');
  const firstDebt = pos.toPay.find((t) => !t.pending);
  const owe = pos.net < 0;
  return (
    <section className="relative overflow-hidden rounded-card bg-ink p-5 lg:hidden">
      <GridPaper />
      <div className="relative">
        <p className="font-mono text-over uppercase text-ink-on2">{pos.net === 0 ? 'Số dư của bạn' : owe ? 'Bạn cần trả' : 'Bạn được nhận'}</p>
        <p className="mt-3 font-mono text-[40px] leading-[48px] font-bold tracking-[-1.5px] text-hl">{formatVnd(Math.abs(pos.net))}</p>
        {owe && pos.toPay.length > 0 && (
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-on2">
            {pos.toPay.length === 1 && (
              <Avatar name={nameOf(pos.toPay[0].toUserId)} tone={avatarToneFor(pos.toPay[0].toUserId)} size={24} />
            )}
            {pos.toPay.length === 1 ? `cho ${nameOf(pos.toPay[0].toUserId)} · 1 giao dịch duy nhất` : `cho ${pos.toPay.length} người`}
          </p>
        )}
        {!owe && pos.net > 0 && <p className="mt-2 text-sm text-ink-on2">Từ {pos.toReceive.map((t) => nameOf(t.fromUserId)).join(', ')}</p>}
        {pos.net === 0 && <p className="mt-2 text-sm text-ink-on2">Bạn đã sòng phẳng với cả nhà.</p>}
        {firstDebt && (
          <Button variant="accent" fullWidth leftIcon={<QrCode />} className="mt-5" onClick={() => onPay(firstDebt)}>
            Trả bằng VietQR
          </Button>
        )}
      </div>
    </section>
  );
}

type HistoryRange = 'this' | 'prev' | 'all';

/** Thanh toán (preview 09 / 10): rút gọn nợ, giao dịch cần tất toán, VietQR, lịch sử. */
export function PaymentsPage() {
  const { house } = useCurrentHouse();
  const me = useAuthStore((s) => s.user);
  const thisMonth = monthKeyOf(new Date());
  const [range, setRange] = useState<HistoryRange>('this');
  const [scope, setScope] = useState<'all' | 'mine'>('all');
  const [paying, setPaying] = useState<PlanTransfer | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);

  useLedgerRealtime(house?.id);
  const plan = useSettlementPlan(house?.id);
  const historyMonth = range === 'this' ? thisMonth : range === 'prev' ? shiftMonth(thisMonth, -1) : undefined;
  const history = useSettlementHistory(house?.id, historyMonth, scope);

  const nameOf = (id: string | undefined) => plan.data?.members.find((m) => m.id === id)?.fullName ?? '';
  const rangeOptions: { value: HistoryRange; label: string }[] = [
    { value: 'this', label: `Tháng ${monthNumber(thisMonth)}` },
    { value: 'prev', label: `Tháng ${monthNumber(shiftMonth(thisMonth, -1))}` },
    { value: 'all', label: 'Tất cả' },
  ];

  return (
    <>
      <PageHeader
        overline={`Tất toán · ${monthOverlineOf(thisMonth)}`}
        title="Thanh toán"
        description="Rút gọn nợ đang bật: mọi khoản nợ chéo được gom về ít giao dịch nhất."
        actions={
          <>
            <SegmentedControl label="Lịch sử theo tháng" options={rangeOptions} value={range} onChange={setRange} className="w-[260px] max-sm:w-full" />
            <Button variant="secondary" leftIcon={<QrCode />} onClick={() => setReceiveOpen(true)}>
              Mã nhận tiền của tôi
            </Button>
          </>
        }
      />

      <div className="mt-6 flex flex-col gap-6 lg:mt-8">
        {plan.isPending ? (
          <div className="grid gap-6 lg:grid-cols-12" aria-busy="true" aria-label="Đang tải kế hoạch thanh toán">
            <Skeleton className="h-[460px] rounded-card lg:col-span-7" />
            <Skeleton className="h-[460px] rounded-card lg:col-span-5" />
          </div>
        ) : plan.isError ? (
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Chưa tải được kế hoạch thanh toán"
            description="Kiểm tra kết nối mạng rồi thử lại nhé."
            action={
              <Button variant="secondary" onClick={() => void plan.refetch()}>
                Thử lại
              </Button>
            }
          />
        ) : (
          <Reveal className="flex flex-col gap-6">
            <MyBalanceCard plan={plan.data} meId={me?.id} onPay={setPaying} />
            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <DebtSimplifyCard plan={plan.data} />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-5">
                {house && plan.data.optimized.length > 0 ? (
                  <SettleList transfers={plan.data.optimized} members={plan.data.members} meId={me?.id} houseId={house.id} onPay={setPaying} />
                ) : (
                  <section className="rounded-card border border-line bg-surface p-6">
                    <EmptyState icon={<CircleCheck />} tone="mint" title="Không còn ai nợ ai" description="Mọi giao dịch đã được xác nhận." className="py-4" />
                  </section>
                )}
                <MyAccountCard me={me} />
              </div>
            </div>
          </Reveal>
        )}

        <HistoryCard
          items={history.data}
          isPending={history.isPending}
          isError={history.isError}
          onRetry={() => void history.refetch()}
          scope={scope}
          onScopeChange={setScope}
          meId={me?.id}
        />
      </div>

      {house && (
        <VietQrModal
          open={!!paying}
          houseId={house.id}
          houseName={house.name}
          transfer={paying}
          fromName={me?.fullName ?? ''}
          toName={nameOf(paying?.toUserId)}
          onClose={() => setPaying(null)}
        />
      )}
      <ReceiveQrModal open={receiveOpen} onClose={() => setReceiveOpen(false)} me={me} />
    </>
  );
}
