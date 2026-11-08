import { ArrowLeftRight, Check, Clock, Gift, Inbox, Repeat, RotateCw, TriangleAlert } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { useNow } from '@/lib/use-now.ts';
import { messageForSwapError } from '../copy.ts';
import { useAcceptSwap, useRejectSwap, useSwapList } from '../hooks.ts';
import { slotLabel, timeLeftLabel } from '../swap-format.ts';
import { acceptFailure, compensationLine, swapHeadline } from '../swap-lists.ts';
import type { Swap } from '../types.ts';

/** Một yêu cầu đích danh gửi tới bạn (preview 15 "Chờ bạn phản hồi"): Đồng ý hoặc Từ chối ngay trên thẻ. */
export function IncomingCard({ swap, now, busy, onAccept, onReject }: { swap: Swap; now: Date; busy: boolean; onAccept: () => void; onReject: () => void }) {
  const line = compensationLine(swap);
  const from = swap.fromAssignment;
  const to = swap.toAssignment;
  return (
    <article className="rounded-card border-[1.5px] border-ink bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={swap.requesterName} tone={avatarToneFor(swap.requesterMemberId)} size={36} />
          <div className="min-w-0">
            <h3 className="text-h4 text-ink">{swapHeadline(swap)}</h3>
            {swap.type === 'EXCHANGE' && from && to ? (
              <p className="mt-0.5 flex items-start gap-1.5 text-cap text-ink-2">
                <ArrowLeftRight className="mt-px size-3.5 shrink-0" aria-hidden />
                <span>
                  Ca của họ {slotLabel(from)} đổi lấy ca của bạn {slotLabel(to)}
                </span>
              </p>
            ) : (
              from && <p className="mt-0.5 text-cap text-ink-2">{slotLabel(from)} · <span className="font-mono">{from.weight} điểm</span></p>
            )}
          </div>
        </div>
        <Chip tone="yellow" size="sm" icon={<Clock />}>
          {timeLeftLabel(swap.expiresAt, now)}
        </Chip>
      </div>

      {(swap.note || swap.reason) && (
        <div className="mt-3 rounded-btn bg-paper-2 px-3 py-2.5 text-sm text-ink">
          {swap.note && <p>“{swap.note}”</p>}
          {swap.reason && <p className={swap.note ? 'mt-1 text-cap text-ink-2' : ''}>Lý do: {swap.reason}</p>}
        </div>
      )}

      {line && (
        <p className="mt-3 flex items-center gap-2 text-sm text-ink-2">
          {line.kind === 'GIFT' ? <Gift className="size-4 shrink-0" aria-hidden /> : <Repeat className="size-4 shrink-0" aria-hidden />}
          <span className="flex-1">Đền đáp: {line.text}</span>
          {line.amountText && <span className="font-mono font-semibold text-ink">{line.amountText}</span>}
        </p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="primary" leftIcon={<Check />} disabled={busy} onClick={onAccept}>
          Đồng ý
        </Button>
        <Button variant="secondary" disabled={busy} onClick={onReject}>
          Từ chối
        </Button>
      </div>
    </article>
  );
}

/** "Chờ bạn phản hồi": các yêu cầu đích danh gửi tới bạn. Bấm lại Đồng ý sau khi mất phản hồi dùng lại cùng Idempotency-Key. */
export function IncomingList({ houseId }: { houseId: string }) {
  const list = useSwapList(houseId, 'INCOMING');
  const accept = useAcceptSwap(houseId);
  const reject = useRejectSwap(houseId);
  const now = useNow();
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

  if (list.isPending) return <Skeleton className="h-[200px] rounded-card" aria-busy="true" />;
  if (list.isError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được yêu cầu gửi tới bạn"
        description={messageForSwapError(list.error)}
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void list.refetch()}>
            Thử lại
          </Button>
        }
        className="py-6"
      />
    );
  }
  const swaps = list.data.filter((s) => !gone.has(s.id));
  if (swaps.length === 0) return <EmptyState icon={<Inbox />} tone="neutral" title="Chưa có yêu cầu nào gửi tới bạn" className="py-6" />;

  const onAccept = (id: string) => {
    setBusyId(id);
    accept.mutate(
      { swapId: id },
      {
        onSuccess: () => toast.success('Bạn đã đồng ý. Ca đã được đổi.'),
        onError: (e) => {
          const failure = acceptFailure(e);
          toast.error(failure.message);
          if (failure.dropCard) setGone((cur) => new Set(cur).add(id));
        },
        onSettled: () => setBusyId(null),
      },
    );
  };
  const onReject = (id: string) => {
    setBusyId(id);
    reject.mutate(
      { swapId: id },
      {
        onSuccess: () => toast('Đã từ chối yêu cầu.'),
        onError: (e) => toast.error(messageForSwapError(e)),
        onSettled: () => setBusyId(null),
      },
    );
  };

  return (
    <ul className="flex flex-col gap-3" aria-label="Yêu cầu gửi tới bạn">
      <AnimatePresence initial={false}>
        {swaps.map((s) => (
          <AnimatedItem as="li" key={s.id}>
            <IncomingCard swap={s} now={now} busy={busyId === s.id} onAccept={() => onAccept(s.id)} onReject={() => onReject(s.id)} />
          </AnimatedItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
