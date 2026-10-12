import { LoaderCircle, RotateCw } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { messageForError } from '../errors.ts';
import { reasonsFor } from '../reasons.ts';
import type { PreviewResult } from '../types.ts';
import { weekDays } from '../week.ts';

export interface PreviewState {
  isPending: boolean;
  isError: boolean;
  error: unknown;
  data: PreviewResult | undefined;
}

/** Xem trước lịch (dry-run, không lưu). Mỗi lần xem là một seed mới nên có thể khác lịch thật. */
export function PreviewDialog({
  open,
  onClose,
  weekKey,
  state,
  onRetry,
}: {
  open: boolean;
  onClose: () => void;
  weekKey: string;
  state: PreviewState;
  onRetry: () => void;
}) {
  const days = weekDays(weekKey);
  const data = state.data;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Xem trước tuần ${weekKey.slice(-2)}`}
      className="sm:max-w-[640px]"
    >
      {state.isPending ? (
        <p className="flex items-center gap-2 text-sm text-ink-2">
          <LoaderCircle className="size-4 animate-spin" aria-hidden /> Đang xếp thử…
        </p>
      ) : state.isError ? (
        <div className="flex flex-col items-start gap-3">
          <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
            {messageForError(state.error)}
          </p>
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={onRetry}>
            Thử lại
          </Button>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-4">
          {reasonsFor(data).length > 0 && (
            <ul className="flex flex-col gap-1.5 text-sm text-ink">
              {reasonsFor(data).map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          {data.slots.length === 0 ? (
            <p className="text-sm text-ink-2">Chưa có ca nào để xếp trong tuần này.</p>
          ) : (
            <ul className="flex max-h-[360px] flex-col gap-3 overflow-y-auto pr-1">
              {days.map((d) => {
                const slots = data.slots.filter((s) => s.occurrenceDate === d.key);
                if (slots.length === 0) return null;
                return (
                  <li key={d.key}>
                    <p className="font-mono text-over uppercase text-ink-2">
                      {d.label} {d.day}.{d.month}
                    </p>
                    <ul className="mt-1.5 flex flex-col gap-1.5">
                      {slots.map((s) => (
                        <li key={s.choreId} className="flex items-center justify-between gap-3 text-sm">
                          <span className="min-w-0 truncate text-ink">{s.choreTitle}</span>
                          <span className="flex shrink-0 items-center gap-2 text-ink-2">
                            {s.memberName && s.memberUserId ? (
                              <>
                                <Avatar name={s.memberName} tone={avatarToneFor(s.memberUserId)} size={20} />
                                {s.memberName.trim().split(/\s+/).at(-1)}
                              </>
                            ) : (
                              'Chưa có người'
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="font-mono text-cap text-ink-3">seed #{data.seed}</p>
        </div>
      ) : null}
      <div className="mt-5 flex justify-end">
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </div>
    </Modal>
  );
}
