import { ArrowRight, Check, Landmark, RotateCw, Store, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { writeView } from '@/features/chores/view-preference.ts';
import { CardEmpty, DashCard } from '@/features/dashboard/DashCard.tsx';
import { messageForSwapError } from '../copy.ts';
import { useAcceptSwap, useRejectSwap, useSwapList, useSwapSummary } from '../hooks.ts';
import { useSwapRealtime } from '../realtime.ts';
import { slotLabel } from '../swap-format.ts';
import { acceptFailure, swapHeadline } from '../swap-lists.ts';
import { debtText, incomingText, marketText } from '../summary-blocks.ts';

const linkCls = 'inline-flex items-center gap-1 text-sm font-semibold text-ink underline decoration-[1.5px] underline-offset-[3px]';

/**
 * Widget "Đổi ca" ở Tổng quan, ba khối: yêu cầu chờ bạn trả lời (Đồng ý / Từ chối ngay tại đây), Chợ ca, nợ ca.
 * Bấm lại Đồng ý dùng lại cùng Idempotency-Key.
 */
export function SwapSummaryWidget({ houseId, className }: { houseId: string | undefined; className?: string }) {
  const navigate = useNavigate();
  useSwapRealtime(houseId);
  const summary = useSwapSummary(houseId);
  const incoming = useSwapList(houseId, 'INCOMING', (summary.data?.incoming ?? 0) > 0);
  const accept = useAcceptSwap(houseId);
  const reject = useRejectSwap(houseId);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openTab = () => {
    writeView('market');
    navigate('/chores');
  };

  let body;
  if (!houseId || summary.isPending) {
    body = (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang tải đổi ca">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  } else if (summary.isError) {
    body = (
      <CardEmpty icon={<TriangleAlert />}>
        Không tải được đổi ca.{' '}
        <button type="button" onClick={() => void summary.refetch()} className="inline-flex items-center gap-1 font-semibold text-ink underline underline-offset-2">
          <RotateCw className="size-3.5" aria-hidden />
          Thử lại
        </button>
      </CardEmpty>
    );
  } else {
    const s = summary.data;
    body = (
      <div className="flex flex-col gap-4">
        <section aria-label="Chờ bạn trả lời">
          <p className="text-sm font-semibold text-ink">{incomingText(s.incoming)}</p>
          {incoming.data && incoming.data.length > 0 && (
            <ul className="mt-2 flex flex-col gap-2">
              {incoming.data.slice(0, 3).map((sw) => (
                <li key={sw.id} className="flex flex-wrap items-center gap-2 rounded-btn bg-paper-2 px-3 py-2">
                  <span className="min-w-0 flex-1 text-sm text-ink">
                    {swapHeadline(sw)}
                    {sw.fromAssignment && <span className="block text-cap text-ink-2">{slotLabel(sw.fromAssignment)}</span>}
                  </span>
                  <Button
                    size="sm"
                    leftIcon={<Check />}
                    disabled={busyId === sw.id}
                    onClick={() => {
                      setBusyId(sw.id);
                      accept.mutate(
                        { swapId: sw.id },
                        {
                          onSuccess: () => toast.success('Bạn đã đồng ý. Ca đã được đổi.'),
                          onError: (e) => toast.error(acceptFailure(e).message),
                          onSettled: () => setBusyId(null),
                        },
                      );
                    }}
                  >
                    Đồng ý
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={busyId === sw.id}
                    onClick={() => {
                      setBusyId(sw.id);
                      reject.mutate({ swapId: sw.id }, { onSuccess: () => toast('Đã từ chối yêu cầu.'), onError: (e) => toast.error(messageForSwapError(e)), onSettled: () => setBusyId(null) });
                    }}
                  >
                    Từ chối
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label="Chợ ca" className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="flex items-center gap-2 text-sm text-ink">
            <Store className="size-4 shrink-0 text-ink-2" aria-hidden />
            {marketText(s.market)}
          </p>
          <button type="button" onClick={openTab} className={linkCls}>
            Xem Chợ ca <ArrowRight className="size-4" aria-hidden />
          </button>
        </section>

        <section aria-label="Nợ ca" className="flex items-center gap-2 border-t border-line pt-4 text-sm text-ink">
          <Landmark className="size-4 shrink-0 text-ink-2" aria-hidden />
          {debtText(s.debtsOwedByMe, s.debtsOwedToMe)}
        </section>
      </div>
    );
  }

  const pending = summary.data ? summary.data.incoming : 0;
  return (
    <DashCard
      className={className}
      overline="Yêu cầu · Chợ ca · Nợ ca"
      title="Đổi ca"
      aside={pending > 0 ? <Chip tone="yellow">{pending} chờ bạn</Chip> : undefined}
    >
      {body}
    </DashCard>
  );
}
