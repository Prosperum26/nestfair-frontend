import { Gift, Repeat, RotateCw, Send, Store, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { SegmentedControl } from '@/components/ui/SegmentedControl.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import type { Assignment } from '@/features/chores/types.ts';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { messageForSwapError } from '../copy.ts';
import { useCreateSwap, useIdempotencyKey, useSwapOptions } from '../hooks.ts';
import { coverBody, requiredWarnings, rewardInput } from '../swap-form.ts';
import type { Compensation, SwapOption, SwapWarning } from '../types.ts';
import { SwapOptionCard } from './SwapOptionCard.tsx';
import { WarningChecks } from './WarningChecks.tsx';

const MARKET = 'MARKET';
const STALE_CODES = new Set(['SLOT_LOCKED', 'SLOT_CHANGED', 'SLOT_NOT_SWAPPABLE', 'TARGET_ABSENT', 'DUPLICATE_CHORE_SAME_DAY', 'URGENT_MARKET_ONLY']);

const COMPENSATION_OPTIONS: { value: Compensation; label: string }[] = [
  { value: 'PAYBACK', label: 'Làm bù' },
  { value: 'GIFT', label: 'Quà cảm ơn' },
];

/**
 * Tab "Nhờ trực dùm": nhờ một người đích danh hoặc đăng lên Chợ ca (COVER), đền đáp bằng làm bù hoặc quà.
 * Ca vòng quay (`giftOnly`) chỉ nhờ được bằng quà. Làm bù không có tiền; quà có thể không tiền (chỉ lời cảm ơn).
 */
export function CoverPanel({
  assignment,
  houseId,
  giftOnly,
  onDone,
}: {
  assignment: Assignment;
  houseId: string;
  giftOnly: boolean;
  onDone: () => void;
}) {
  const [compensation, setCompensation] = useState<Compensation>(giftOnly ? 'GIFT' : 'PAYBACK');
  const options = useSwapOptions(houseId, assignment.id, 'COVER', compensation, true);
  const create = useCreateSwap(houseId);
  const key = useIdempotencyKey();
  const [target, setTarget] = useState<string | null>(null);
  const [acked, setAcked] = useState<SwapWarning[]>([]);
  const [rewardText, setRewardText] = useState('');
  const [rewardNote, setRewardNote] = useState('');
  const [note, setNote] = useState('');
  const [reason, setReason] = useState('');

  const list: SwapOption[] = options.data?.options ?? [];
  const market = options.data?.market;
  const selected = target && target !== MARKET ? (list.find((o) => o.memberId === target) ?? null) : null;
  const isMarket = target === MARKET && !!market?.allowed;
  const hasTarget = isMarket || (!!selected && selected.valid);
  const gift = compensation === 'GIFT';
  const reward = gift ? rewardInput(rewardText) : { amount: null, error: null };
  // Cảnh báo chỉ có với người nhận cụ thể: lấy theo lựa chọn hiện tại.
  const required = selected ? requiredWarnings(selected) : [];
  const missing = required.filter((w) => !acked.includes(w));
  const blocked = !hasTarget || create.isPending || !!reward.error || missing.length > 0;

  const touch = () => key.renew();
  const toggle = (w: SwapWarning) => {
    setAcked((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w]));
    touch();
  };
  const choose = (next: string) => {
    setTarget(next);
    setAcked([]);
    touch();
  };
  const changeCompensation = (next: Compensation) => {
    setCompensation(next);
    setTarget(null);
    setAcked([]);
    touch();
  };
  const edit = (set: (v: string) => void) => (e: { target: { value: string } }) => {
    set(e.target.value);
    touch();
  };

  const submit = () => {
    if (blocked) return;
    create.mutate(
      {
        body: coverBody({
          fromAssignmentId: assignment.id,
          targetMemberId: isMarket ? null : selected!.memberId,
          compensation,
          rewardText,
          rewardNote,
          note,
          reason,
          acked,
        }),
        key: key.current(),
      },
      {
        onSuccess: () => {
          key.renew();
          toast.success(isMarket ? 'Đã đăng ca lên Chợ ca.' : `Đã gửi yêu cầu cho ${firstName(selected!.memberName)}.`);
          onDone();
        },
        onError: (e) => {
          const code = (e as { code?: string }).code;
          toast.error(messageForSwapError(e, { name: selected?.memberName }));
          if (code && STALE_CODES.has(code)) void options.refetch();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {giftOnly ? (
        <p className="flex items-start gap-2 rounded-card bg-lil-bg px-3 py-2.5 text-cap text-lil">
          <Gift className="mt-px size-4 shrink-0" aria-hidden />
          Việc đột xuất chỉ nhờ được bằng quà.
        </p>
      ) : (
        <div>
          <h3 className="mb-2 text-h4 text-ink">Bạn đền đáp thế nào?</h3>
          <SegmentedControl label="Cách đền đáp" options={COMPENSATION_OPTIONS} value={compensation} onChange={changeCompensation} />
          <p className="mt-2 flex items-start gap-1.5 text-cap text-ink-2">
            {gift ? <Gift className="mt-px size-3.5 shrink-0" aria-hidden /> : <Repeat className="mt-px size-3.5 shrink-0" aria-hidden />}
            {gift ? 'Người nhận giúp được tặng quà cảm ơn, không phải làm bù.' : 'Người nhận giúp sẽ được bạn làm bù một ca có độ nặng tương đương ở tuần sau.'}
          </p>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-h4 text-ink">Nhờ ai?</h3>
        {options.isPending ? (
          <div className="flex flex-col gap-2" aria-busy="true" aria-label="Đang tải danh sách người nhận">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[60px] rounded-card" />
            ))}
          </div>
        ) : options.isError ? (
          <EmptyState
            icon={<TriangleAlert />}
            tone="tom"
            title="Không tải được danh sách người nhận"
            description={messageForSwapError(options.error)}
            action={
              <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void options.refetch()}>
                Thử lại
              </Button>
            }
            className="py-6"
          />
        ) : (
          <div role="radiogroup" aria-label="Người được nhờ" className="flex flex-col gap-2">
            {list.map((o) => (
              <SwapOptionCard key={o.memberId} option={o} name="cover-target" selected={target === o.memberId} onSelect={() => choose(o.memberId)} />
            ))}
            <label
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors',
                target === MARKET ? 'border-[1.5px] border-ink bg-hl-soft' : 'border-line bg-surface hover:bg-paper',
                !market?.allowed && 'cursor-not-allowed opacity-60 hover:bg-surface',
              )}
            >
              <input
                type="radio"
                name="cover-target"
                checked={target === MARKET}
                disabled={!market?.allowed}
                onChange={() => choose(MARKET)}
                className="mt-1 size-4 shrink-0 accent-ink"
              />
              <Store className="mt-0.5 size-5 shrink-0 text-ink-2" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-h4 text-ink">Đăng lên Chợ ca</span>
                <span className="block text-cap text-ink-2">Cả phòng thấy, người đầu tiên bấm Nhận giúp sẽ nhận ca.</span>
                {!market?.allowed && market?.reasonText && (
                  <span className="mt-1.5 flex items-start gap-1.5 text-cap text-tom">
                    <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
                    {market.reasonText}
                  </span>
                )}
              </span>
            </label>
          </div>
        )}
      </div>

      {gift && (
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <div>
            <label htmlFor="cover-reward-note" className="mb-1.5 block text-h4 text-ink">
              Lời cảm ơn / quà
            </label>
            <Input id="cover-reward-note" value={rewardNote} maxLength={100} placeholder="Ví dụ: Bao 1 ly trà sữa" onChange={edit(setRewardNote)} />
          </div>
          <div>
            <label htmlFor="cover-reward-amount" className="mb-1.5 block text-h4 text-ink">
              Số tiền (tùy chọn)
            </label>
            <Input
              id="cover-reward-amount"
              inputMode="numeric"
              value={rewardText}
              placeholder="30.000"
              invalid={!!reward.error}
              className="font-mono"
              rightSlot={<span className="font-mono text-ink-2">đ</span>}
              onChange={edit(setRewardText)}
            />
            {reward.error && (
              <p id="cover-reward-amount-error" role="alert" className="mt-1 text-cap text-tom">
                {reward.error}
              </p>
            )}
          </div>
        </div>
      )}

      {!isMarket && (
        <div>
          <label htmlFor="cover-note" className="mb-1.5 block text-h4 text-ink">
            Lời nhắn
          </label>
          <Input id="cover-note" value={note} maxLength={200} placeholder="Ví dụ: CN mình đi thực tập tối, nhờ bạn nha." onChange={edit(setNote)} />
        </div>
      )}
      <div>
        <label htmlFor="cover-reason" className="mb-1.5 block text-h4 text-ink">
          Lý do (tùy chọn, chỉ người nhận và trưởng phòng thấy)
        </label>
        <Input id="cover-reason" value={reason} maxLength={200} onChange={edit(setReason)} />
      </div>

      <WarningChecks warnings={required} acked={acked} onToggle={toggle} idPrefix="cv-warn" />

      {missing.length > 0 && (
        <p role="status" className="text-cap text-tom">
          Hãy đọc và tick xác nhận cảnh báo trước khi gửi.
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Hủy
        </Button>
        <Button variant="primary" leftIcon={<Send />} disabled={blocked} loading={create.isPending} onClick={submit}>
          {isMarket ? 'Đăng lên Chợ ca' : selected ? `Gửi cho ${firstName(selected.memberName)}` : 'Gửi yêu cầu'}
        </Button>
      </div>
    </div>
  );
}
