import { RotateCw, Store, TriangleAlert } from 'lucide-react';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatedItem } from '@/components/ui/AnimatedList.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { holdFor } from '@/lib/celebrate.ts';
import { type Pin, withPinned } from '@/lib/pinned.ts';
import { useNow } from '@/lib/use-now.ts';
import { messageForSwapError } from '../copy.ts';
import { useAcceptSwap, useSwapList } from '../hooks.ts';
import { acceptFailure } from '../swap-lists.ts';
import type { Swap } from '../types.ts';
import { MarketCard } from './MarketCard.tsx';

/**
 * Chợ ca (preview 15): các yêu cầu COVER chưa có người nhận, hạn gần nhất lên trước (D13).
 * Hai người cùng bấm "Nhận giúp": một người thành công, người kia thấy "Ca đã có người nhận" và thẻ biến khỏi
 * danh sách (không cần chờ socket). Mỗi lần bấm dùng một Idempotency-Key mới.
 */
export function MarketList({ houseId }: { houseId: string }) {
  const list = useSwapList(houseId, 'MARKET');
  const accept = useAcceptSwap(houseId);
  const now = useNow();
  // Thẻ vừa bị báo "đã có người nhận": ẩn ngay, danh sách thật tải lại ngay sau đó.
  const [gone, setGone] = useState<ReadonlySet<string>>(new Set());
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [accepted, setAccepted] = useState<ReadonlySet<string>>(new Set());
  const reduceMotion = useReducedMotion();
  // Thẻ đang nhận: ghim từ lúc bấm để socket tải lại danh sách không gỡ nó trước khi hiện "Đã nhận".
  const [pinned, setPinned] = useState<ReadonlyMap<string, Pin<Swap>>>(new Map());
  const unpin = (id: string) =>
    setPinned((cur) => {
      const next = new Map(cur);
      next.delete(id);
      return next;
    });

  if (list.isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải Chợ ca">
        {[0, 1].map((i) => (
          <Skeleton key={i} className="h-[148px] rounded-card" />
        ))}
      </div>
    );
  }
  if (list.isError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được Chợ ca"
        description={messageForSwapError(list.error)}
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void list.refetch()}>
            Thử lại
          </Button>
        }
      />
    );
  }

  const swaps = withPinned(
    list.data.filter((s) => !gone.has(s.id)),
    pinned,
    (s) => s.id,
  );
  if (swaps.length === 0) {
    return <EmptyState icon={<Store />} tone="yellow" title="Chợ ca đang trống" description="Khi ai đó cần người trực dùm, ca sẽ hiện ở đây cho cả phòng thấy." />;
  }

  const onAccept = (id: string) => {
    setPendingId(id);
    setPinned((cur) => new Map(cur).set(id, { item: swaps.find((s) => s.id === id)!, index: swaps.findIndex((s) => s.id === id) }));
    accept.mutate(
      { swapId: id },
      {
        onSuccess: (res) => {
          setAccepted((cur) => new Set(cur).add(id));
          setTimeout(() => unpin(id), holdFor('swapAccepted', reduceMotion));
          const slot = res.swap.fromAssignment;
          toast.success(slot ? `Bạn đã nhận ca ${slot.choreTitle}.` : 'Bạn đã nhận ca.');
        },
        onError: (e) => {
          unpin(id);
          const failure = acceptFailure(e);
          toast.error(failure.message);
          if (failure.dropCard) setGone((cur) => new Set(cur).add(id));
        },
        onSettled: () => setPendingId(null),
      },
    );
  };

  return (
    <ul className="flex flex-col gap-3" aria-label="Ca đang cần người nhận">
      <AnimatePresence initial={false}>
        {swaps.map((s) => (
          <AnimatedItem as="li" key={s.id}>
            <MarketCard swap={s} now={now} accepting={pendingId === s.id} accepted={accepted.has(s.id)} onAccept={() => onAccept(s.id)} />
          </AnimatedItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}
