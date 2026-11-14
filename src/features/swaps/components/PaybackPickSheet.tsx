import { Check, Hourglass, RotateCw, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Chip } from '@/components/ui/Chip.tsx';
import { EmptyState } from '@/components/ui/EmptyState.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { cn } from '@/lib/cn.ts';
import { firstName } from '@/lib/date.ts';
import { useNow } from '@/lib/use-now.ts';
import { messageForSwapError } from '../copy.ts';
import { deadlineNote, paybackNotice } from '../debts.ts';
import { useIdempotencyKey, usePaybackOptions, usePickPayback } from '../hooks.ts';
import { pointsLabel, slotLabel, weightDiffLabel } from '../swap-format.ts';
import type { Debt, PaybackOption } from '../types.ts';

function OptionRow({ option, selected, onSelect }: { option: PaybackOption; selected: boolean; onSelect: () => void }) {
  const disabled = !option.valid;
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-card border p-3 transition-colors',
        selected ? 'border-[1.5px] border-ink bg-hl-soft' : 'border-line bg-surface hover:bg-paper',
        disabled && 'cursor-not-allowed opacity-60 hover:bg-surface',
      )}
    >
      <input type="radio" name="payback-slot" checked={selected} disabled={disabled} onChange={onSelect} className="mt-1 size-4 shrink-0 accent-ink" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-h4 text-ink">{slotLabel(option)}</span>
        <span className="mt-0.5 block text-cap text-ink-2">
          <span className="font-mono">{pointsLabel(option.weight)}</span>
        </span>
        {disabled && option.reasonText && (
          <span className="mt-1.5 flex items-start gap-1.5 text-cap text-tom">
            <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
            {option.reasonText}
          </span>
        )}
      </span>
      {!disabled && (
        <Chip tone={option.weightDiff === 0 ? 'mint' : 'yellow'} size="sm" className="font-mono">
          {weightDiffLabel(option.weightDiff)}
        </Chip>
      )}
    </label>
  );
}

function Body({ houseId, debt, onClose }: { houseId: string; debt: Debt; onClose: () => void }) {
  const options = usePaybackOptions(houseId, debt.id, true);
  const pick = usePickPayback(houseId);
  const key = useIdempotencyKey();
  const now = useNow();
  const [selected, setSelected] = useState<string | null>(null);
  const list = options.data?.options ?? [];
  const chosen = list.find((o) => o.assignmentId === selected && o.valid) ?? null;
  const note = deadlineNote(debt, now);

  const submit = () => {
    if (!chosen) return;
    pick.mutate(
      { debtId: debt.id, assignmentId: chosen.assignmentId, key: key.current() },
      {
        onSuccess: () => {
          key.renew();
          toast.success(`Đã chọn ${chosen.choreTitle} cho ${firstName(debt.debtorName)} làm bù.`);
          onClose();
        },
        onError: (e) => {
          toast.error(messageForSwapError(e));
          void options.refetch();
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-card bg-lil-bg px-3 py-2.5 text-cap text-lil">
        <Hourglass className="size-4 shrink-0" aria-hidden />
        <span>
          {firstName(debt.debtorName)} nợ bạn <span className="font-mono">{pointsLabel(debt.weight)}</span>. Chọn một ca của bạn để họ làm bù.
        </span>
      </p>

      {options.isPending ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-label="Đang tải các ca có thể chọn">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[64px] rounded-card" />
          ))}
        </div>
      ) : options.isError ? (
        <EmptyState
          icon={<TriangleAlert />}
          tone="tom"
          title="Không tải được các ca có thể chọn"
          description={messageForSwapError(options.error)}
          action={
            <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void options.refetch()}>
              Thử lại
            </Button>
          }
          className="py-6"
        />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Hourglass />}
          tone="yellow"
          title="Chưa có ca nào để chọn"
          description="Tuần sau của bạn chưa có ca phù hợp. Hệ thống sẽ thử lại khi có lịch mới."
          className="py-6"
        />
      ) : (
        <div role="radiogroup" aria-label="Ca làm bù" className="flex flex-col gap-2">
          {list.map((o) => (
            <OptionRow
              key={o.assignmentId}
              option={o}
              selected={selected === o.assignmentId}
              onSelect={() => {
                setSelected(o.assignmentId);
                key.renew();
              }}
            />
          ))}
        </div>
      )}

      <p className="text-cap text-ink-2">{paybackNotice()}</p>
      {note && <p className="text-cap font-semibold text-hl-ink">{note}</p>}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Để sau
        </Button>
        <Button variant="primary" leftIcon={<Check />} disabled={!chosen} loading={pick.isPending} onClick={submit}>
          {chosen ? `Chọn ${chosen.choreTitle}` : 'Chọn ca này'}
        </Button>
      </div>
    </div>
  );
}

/** Màn chọn ca bù cho một khoản nợ (người được nợ chọn một ca của mình để người nợ làm). */
export function PaybackPickSheet({ houseId, debt, onClose }: { houseId: string; debt: Debt | null; onClose: () => void }) {
  return (
    <Modal open={!!debt} onClose={onClose} overline="Làm bù · Nợ ca" title={debt ? `Chọn ca cho ${firstName(debt.debtorName)}` : 'Chọn ca làm bù'}>
      {debt && <Body key={debt.id} houseId={houseId} debt={debt} onClose={onClose} />}
    </Modal>
  );
}
