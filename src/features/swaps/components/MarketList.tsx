import { RotateCw, Store, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { useNow } from '@/lib/use-now.ts';
import { messageForSwapError } from '../copy.ts';
import { useAcceptSwap, useSwapList } from '../hooks.ts';
import { acceptFailure } from '../swap-lists.ts';
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

  const swaps = list.data.filter((s) => !gone.has(s.id));
  if (swaps.length === 0) {
    return <EmptyState icon={<Store />} tone="yellow" title="Chợ ca đang trống" description="Khi ai đó cần người trực dùm, ca sẽ hiện ở đây cho cả phòng thấy." />;
  }

  const onAccept = (id: string) => {
    setPendingId(id);
    accept.mutate(
      { swapId: id, key: crypto.randomUUID() },
      {
        onSuccess: (res) => {
          const slot = res.swap.fromAssignment;
          toast.success(slot ? `Bạn đã nhận ca ${slot.choreTitle}.` : 'Bạn đã nhận ca.');
        },
        onError: (e) => {
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
      {swaps.map((s) => (
        <li key={s.id}>
          <MarketCard swap={s} now={now} accepting={pendingId === s.id} onAccept={() => onAccept(s.id)} />
        </li>
      ))}
    </ul>
  );
}
