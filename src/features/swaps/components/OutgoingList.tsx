import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { messageForSwapError } from '../copy.ts';
import { useCancelSwap, useSwapList } from '../hooks.ts';
import { slotLabel } from '../swap-format.ts';
import { outgoingChip } from '../swap-lists.ts';
import type { Swap } from '../types.ts';
import { ExpiredCard } from './ExpiredCard.tsx';

function summary(swap: Swap): string {
  const from = swap.fromAssignment;
  const to = swap.toAssignment;
  if (swap.type === 'EXCHANGE' && from && to) return `${slotLabel(from)}, đổi lấy ${slotLabel(to)}`;
  return from ? `${slotLabel(from)} · ${swap.market ? 'đăng Chợ ca' : `nhờ ${swap.targetName ?? ''}`.trim()}` : 'Yêu cầu đổi ca';
}

/**
 * Yêu cầu bạn đã gửi: thẻ "Chưa ai nhận ca của bạn" cho yêu cầu đã hết hạn đang chờ chọn (cố định trên đầu),
 * và mục "Yêu cầu của bạn" cho các yêu cầu còn chờ, mỗi cái có nút Hủy. Không có gì thì không hiện gì.
 */
export function OutgoingSection({ houseId, part }: { houseId: string; part: 'expired' | 'pending' }) {
  const list = useSwapList(houseId, 'OUTGOING');
  const cancel = useCancelSwap(houseId);
  const swaps = list.data ?? [];

  if (part === 'expired') {
    const expired = swaps.filter((s) => s.status === 'EXPIRED');
    if (expired.length === 0) return null;
    return (
      <div className="flex flex-col gap-3">
        {expired.map((s) => (
          <ExpiredCard key={s.id} houseId={houseId} swap={s} />
        ))}
      </div>
    );
  }

  const pending = swaps.filter((s) => s.status === 'PENDING');
  if (pending.length === 0) return null;
  return (
    <section aria-label="Yêu cầu của bạn" className="rounded-card border border-line bg-surface p-4">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-display text-ct text-ink">Yêu cầu của bạn</h2>
        <span className="font-mono text-cap text-ink-2">{pending.length}</span>
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {pending.map((s) => {
          const chip = outgoingChip(s);
          return (
            <li key={s.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
              <Send className="size-4 shrink-0 text-ink-3" aria-hidden />
              <span className="min-w-0 flex-1 text-sm text-ink">{summary(s)}</span>
              <Chip tone={chip.tone} size="sm">
                {chip.label}
              </Chip>
              <Button
                size="sm"
                variant="secondary"
                loading={cancel.isPending && cancel.variables === s.id}
                onClick={() => cancel.mutate(s.id, { onSuccess: () => toast('Đã hủy yêu cầu.'), onError: (e) => toast.error(messageForSwapError(e)) })}
              >
                Hủy
              </Button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
