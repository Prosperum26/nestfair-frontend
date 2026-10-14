import { ArrowRight, Check, Clock, ImageIcon, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { dayMonth } from '@/features/expenses/grouping.ts';
import { useCancelSettlement, useConfirmSettlement } from '@/features/expenses/hooks.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { transferRole } from '../plan-view.ts';
import type { PlanMember, PlanTransfer } from '../types.ts';

const pad = (n: number) => n.toString().padStart(2, '0');
const stamp = (iso: string) => {
  const d = new Date(iso);
  return `${dayMonth(iso)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function TransferRow({
  transfer,
  members,
  meId,
  houseId,
  onPay,
}: {
  transfer: PlanTransfer;
  members: PlanMember[];
  meId: string | undefined;
  houseId: string;
  onPay: (t: PlanTransfer) => void;
}) {
  const confirm = useConfirmSettlement(houseId);
  const cancel = useCancelSettlement(houseId);
  const role = transferRole(transfer, meId);
  const from = members.find((m) => m.id === transfer.fromUserId);
  const to = members.find((m) => m.id === transfer.toUserId);
  const nameOf = (m: PlanMember | undefined) => (!m ? '?' : m.id === meId ? 'Bạn' : firstName(m.fullName));
  const toFirst = to ? firstName(to.fullName) : '';
  const fromFirst = from ? firstName(from.fullName) : '';
  const p = transfer.pending;
  const mine = role === 'payer' && !p;

  // mutateAsync thay vì callback của mutate(): xác nhận xong giao dịch biến khỏi kế hoạch nên hàng này bị gỡ,
  // mà TanStack Query không gọi callback của mutate() cho component đã gỡ (toast sẽ mất).
  const doConfirm = () =>
    confirm.mutateAsync(p!.id).then(
      () => toast(`Đã ghi nhận ${formatVnd(p!.amount)} từ ${fromFirst}.`),
      (e: unknown) => toast(ledgerErrorMessage(e)),
    );
  const doCancel = (msg: string) =>
    cancel.mutateAsync(p!.id).then(
      () => toast(msg),
      (e: unknown) => toast(ledgerErrorMessage(e)),
    );

  return (
    <li className={cn('rounded-card border p-4', mine ? 'border-[1.5px] border-ink bg-hl-soft shadow-hard' : 'border-line bg-surface')}>
      <div className="flex items-center gap-3">
        <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
          {from && <Avatar name={from.fullName} tone={avatarToneFor(from.id)} src={from.avatarUrl} size={32} />}
          <ArrowRight className="size-4 text-ink-2" />
          {to && <Avatar name={to.fullName} tone={avatarToneFor(to.id)} src={to.avatarUrl} size={32} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">
            {nameOf(from)} → {nameOf(to)}
          </p>
          <p className="text-cap text-ink-2">{p ? `Đã báo chuyển ${stamp(p.createdAt)}` : role === 'receiver' ? `Chờ ${fromFirst} chuyển` : 'Chưa trả'}</p>
        </div>
        <span className="shrink-0 font-mono text-mm text-ink">{formatVnd(transfer.amount)}</span>
      </div>

      {(p || mine) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {p && (
            <>
              <Chip tone="yellow" icon={<Clock />}>
                {role === 'receiver' ? 'Chờ bạn xác nhận' : `Chờ ${toFirst} xác nhận`}
              </Chip>
              {p.amount !== transfer.amount && <Chip tone="outline">Báo {formatVnd(p.amount)}</Chip>}
              {p.proofUrl && (
                <a href={p.proofUrl} target="_blank" rel="noreferrer" className="focus-visible:outline-none focus-visible:shadow-focus rounded-full">
                  <Chip tone="outline" icon={<ImageIcon />}>
                    Xem bill
                  </Chip>
                </a>
              )}
            </>
          )}
          {mine && (
            <Button variant="accent" fullWidth leftIcon={<QrCode />} onClick={() => onPay(transfer)}>
              Trả bằng VietQR
            </Button>
          )}
          {p && role === 'receiver' && (
            <div className="mt-1 flex w-full gap-2">
              <Button size="sm" leftIcon={<Check />} loading={confirm.isPending} disabled={cancel.isPending} onClick={doConfirm} className="flex-1">
                Xác nhận đã nhận tiền
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<X />}
                loading={cancel.isPending}
                disabled={confirm.isPending}
                onClick={() => doCancel(`Đã báo ${fromFirst} là bạn chưa nhận được tiền.`)}
              >
                Chưa nhận được
              </Button>
            </div>
          )}
          {p && role === 'payer' && (
            <Button size="sm" variant="ghost" leftIcon={<X />} loading={cancel.isPending} onClick={() => doCancel('Đã hủy báo chuyển.')} className="ml-auto">
              Hủy báo
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

/** "Cần tất toán" (ảnh 09): mọi giao dịch sau rút gọn; giao dịch của bạn nổi bật kèm nút trả. */
export function SettleList({
  transfers,
  members,
  meId,
  houseId,
  onPay,
}: {
  transfers: PlanTransfer[];
  members: PlanMember[];
  meId: string | undefined;
  houseId: string;
  onPay: (t: PlanTransfer) => void;
}) {
  // Giao dịch liên quan tới mình lên trước.
  const sorted = [...transfers].sort((a, b) => Number(transferRole(b, meId) !== 'other') - Number(transferRole(a, meId) !== 'other'));
  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Cần tất toán</h2>
        <span className="flex size-7 items-center justify-center rounded-full border border-line-2 font-mono text-cap text-ink">{transfers.length}</span>
      </header>
      {transfers.length === 0 ? (
        <p className="mt-4 text-sm text-ink-2">Không còn giao dịch nào cần tất toán.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {sorted.map((t) => (
            <TransferRow key={`${t.fromUserId}-${t.toUserId}`} transfer={t} members={members} meId={meId} houseId={houseId} onPay={onPay} />
          ))}
        </ul>
      )}
    </section>
  );
}
