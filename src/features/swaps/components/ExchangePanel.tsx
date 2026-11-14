import { Clock, RotateCw, Send, TriangleAlert, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import type { Assignment } from '@/features/chores/types.ts';
import { firstName } from '@/lib/date.ts';
import { messageForSwapError } from '../copy.ts';
import { useCreateSwap, useIdempotencyKey, useSwapOptions } from '../hooks.ts';
import { exchangeBody, exchangeSubmitState, requiredWarnings } from '../swap-form.ts';
import type { SwapWarning } from '../types.ts';
import { SwapOptionCard } from './SwapOptionCard.tsx';
import { WarningChecks } from './WarningChecks.tsx';

/** Lỗi sau đó danh sách ứng viên đã cũ: tải lại để người dùng thấy trạng thái thật. */
const STALE_CODES = new Set(['SLOT_LOCKED', 'SLOT_CHANGED', 'SLOT_NOT_SWAPPABLE', 'WEEK_MISMATCH', 'TARGET_ABSENT', 'DUPLICATE_CHORE_SAME_DAY']);

/** Tab "Đổi với bạn": chọn một ca của bạn cùng phòng để hoán đổi (EXCHANGE). */
export function ExchangePanel({ assignment, houseId, onDone }: { assignment: Assignment; houseId: string; onDone: () => void }) {
  const options = useSwapOptions(houseId, assignment.id, 'EXCHANGE', 'GIFT', true);
  const create = useCreateSwap(houseId);
  const key = useIdempotencyKey();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [acked, setAcked] = useState<SwapWarning[]>([]);
  const [note, setNote] = useState('');

  const list = options.data?.options ?? [];
  const selected = list.find((o) => o.assignmentId === selectedId) ?? null;
  const required = requiredWarnings(selected);
  const state = exchangeSubmitState({ selected, acked, submitting: create.isPending });

  const select = (id: string) => {
    setSelectedId(id);
    setAcked([]);
    key.renew();
  };
  const toggle = (w: SwapWarning) => setAcked((cur) => (cur.includes(w) ? cur.filter((x) => x !== w) : [...cur, w]));

  const submit = () => {
    if (!selected || state.disabled) return;
    create.mutate(
      { body: exchangeBody({ fromAssignmentId: assignment.id, option: selected, acked, note, reason: '' }), key: key.current() },
      {
        onSuccess: () => {
          key.renew();
          toast.success(`Đã gửi yêu cầu cho ${firstName(selected.memberName)}.`);
          onDone();
        },
        onError: (e) => {
          const code = (e as { code?: string }).code;
          toast.error(messageForSwapError(e, { name: selected.memberName }));
          if (code && STALE_CODES.has(code)) void options.refetch();
        },
      },
    );
  };

  if (options.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Đang tải các ca có thể đổi">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[68px] rounded-card" />
        ))}
      </div>
    );
  }
  if (options.isError) {
    return (
      <EmptyState
        icon={<TriangleAlert />}
        tone="tom"
        title="Không tải được các ca có thể đổi"
        description={messageForSwapError(options.error)}
        action={
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void options.refetch()}>
            Thử lại
          </Button>
        }
        className="py-6"
      />
    );
  }
  if (list.length === 0) {
    return (
      <EmptyState
        icon={<UsersRound />}
        tone="yellow"
        title="Chưa có ca nào để đổi"
        description="Bạn cùng phòng chưa có ca nào trong tuần này. Thử nhờ trực dùm thay vì đổi."
        className="py-6"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-h4 text-ink">Chọn ca muốn đổi</h3>
          <span className="text-cap text-ink-2">Ca mờ là ca không hợp lệ</span>
        </div>
        <div role="radiogroup" aria-label="Ca muốn đổi" className="flex flex-col gap-2">
          {list.map((o) => (
            <SwapOptionCard
              key={o.assignmentId}
              option={o}
              name="exchange-target"
              selected={o.assignmentId === selectedId}
              onSelect={() => select(o.assignmentId!)}
              selfWeight={assignment.weight}
            />
          ))}
        </div>
      </div>

      <WarningChecks warnings={required} acked={acked} onToggle={toggle} idPrefix="ex-warn" />

      <div>
        <label htmlFor="exchange-note" className="mb-1.5 block text-h4 text-ink">
          Lời nhắn
        </label>
        <Input
          id="exchange-note"
          value={note}
          maxLength={200}
          placeholder="Ví dụ: T7 mình về quê, đổi CN giúp mình nha!"
          onChange={(e) => {
            setNote(e.target.value);
            key.renew();
          }}
        />
      </div>

      <p className="flex items-start gap-2 rounded-card bg-sky-bg px-3 py-2.5 text-cap text-sky">
        <Clock className="mt-px size-4 shrink-0" aria-hidden />
        Người nhận có tối đa 24 giờ để trả lời. Hệ thống kiểm tra lại quy tắc ngay lúc họ bấm đồng ý.
      </p>

      {state.hint && (
        <p role="status" className="text-cap text-tom">
          {state.hint}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onDone}>
          Hủy
        </Button>
        <Button variant="primary" leftIcon={<Send />} disabled={state.disabled} loading={create.isPending} onClick={submit}>
          {selected ? `Gửi yêu cầu cho ${firstName(selected.memberName)}` : 'Gửi yêu cầu'}
        </Button>
      </div>
    </div>
  );
}
