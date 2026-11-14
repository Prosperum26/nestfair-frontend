import { ArrowRight, Check, CircleCheck, Clock, ImageIcon, QrCode, X } from 'lucide-react';
import { AnimatePresence, m, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { dayMonth } from '@/features/expenses/grouping.ts';
import { useCancelSettlement, useConfirmSettlement } from '@/features/expenses/hooks.ts';
import { holdFor } from '@/lib/celebrate.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { formatVnd } from '@/lib/format.ts';
import { duration, ease } from '@/lib/motion.ts';
import { type Pin, withPinned } from '@/lib/pinned.ts';
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
  onConfirmStart,
  onConfirmEnd,
}: {
  transfer: PlanTransfer;
  members: PlanMember[];
  meId: string | undefined;
  houseId: string;
  onPay: (t: PlanTransfer) => void;
  /** Ghim dòng khi bắt đầu xác nhận để dữ liệu mới (kể cả qua socket) không gỡ nó giữa chừng hiệu ứng. */
  onConfirmStart: () => void;
  onConfirmEnd: (ok: boolean) => void;
}) {
  const confirm = useConfirmSettlement(houseId);
  // Vừa xác nhận đã nhận tiền: gạch bút dạ quang dưới số tiền, đổi nút thành dấu "Đã nhận" cho tới khi dòng rời danh sách.
  const [settled, setSettled] = useState(false);
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
  const doConfirm = () => {
    onConfirmStart();
    return confirm.mutateAsync(p!.id).then(
      () => {
        setSettled(true);
        onConfirmEnd(true);
        toast(`Đã ghi nhận ${formatVnd(p!.amount)} từ ${fromFirst}.`);
      },
      (e: unknown) => {
        onConfirmEnd(false);
        toast(ledgerErrorMessage(e));
      },
    );
  };
  const doCancel = (msg: string) =>
    cancel.mutateAsync(p!.id).then(
      () => toast(msg),
      (e: unknown) => toast(ledgerErrorMessage(e)),
    );

  return (
    <AnimatedItem as="li" className={cn('rounded-card border p-4', mine ? 'border-[1.5px] border-ink bg-hl-soft shadow-hard' : 'border-line bg-surface')}>
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
        <span className="relative shrink-0 font-mono text-mm text-ink">
          {settled && (
            <m.span
              aria-hidden
              className="absolute inset-x-[-4px] bottom-0.5 h-2.5 origin-left rounded-sm bg-hl"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: duration.slow, ease: ease.out }}
            />
          )}
          <span className="relative">{formatVnd(transfer.amount)}</span>
        </span>
      </div>

      {(p || mine) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {p && (
            <>
              {!settled && (
                <Chip tone="yellow" icon={<Clock />}>
                  {role === 'receiver' ? 'Chờ bạn xác nhận' : `Chờ ${toFirst} xác nhận`}
                </Chip>
              )}
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
          {p && role === 'receiver' && settled && (
            <Chip tone="mint" icon={<Check />}>
              Đã nhận
            </Chip>
          )}
          {p && role === 'receiver' && !settled && (
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
    </AnimatedItem>
  );
}

/** "Cần tất toán" (ảnh 09): mọi giao dịch sau rút gọn; giao dịch của bạn nổi bật kèm nút trả. */
const keyOf = (t: PlanTransfer) => `${t.fromUserId}-${t.toUserId}`;

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
  const reduceMotion = useReducedMotion();
  // Dòng đang xác nhận / vừa xác nhận: giữ trên màn tới khi hiệu ứng chạy xong.
  const [pinned, setPinned] = useState<ReadonlyMap<string, Pin<PlanTransfer>>>(new Map());
  const unpin = (key: string) =>
    setPinned((cur) => {
      const next = new Map(cur);
      next.delete(key);
      return next;
    });
  const shown = withPinned(sorted, pinned, keyOf);
  // Hết giao dịch (và không còn dòng nào đang chạy hiệu ứng): thẻ "không còn ai nợ ai".
  if (shown.length === 0) {
    return (
      <section className="rounded-card border border-line bg-surface p-6">
        <EmptyState icon={<CircleCheck />} tone="mint" title="Không còn ai nợ ai" description="Mọi giao dịch đã được xác nhận." className="py-4" />
      </section>
    );
  }
  return (
    <section className="rounded-card border border-line bg-surface p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="font-display text-ct text-ink">Cần tất toán</h2>
        <span className="flex size-7 items-center justify-center rounded-full border border-line-2 font-mono text-cap text-ink">{transfers.length}</span>
      </header>
      <ul className="mt-4 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {shown.map((t, index) => (
            <TransferRow
              key={keyOf(t)}
              transfer={t}
              members={members}
              meId={meId}
              houseId={houseId}
              onPay={onPay}
              onConfirmStart={() => setPinned((cur) => new Map(cur).set(keyOf(t), { item: t, index }))}
              onConfirmEnd={(ok) => (ok ? setTimeout(() => unpin(keyOf(t)), holdFor('settled', reduceMotion)) : unpin(keyOf(t)))}
            />
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
