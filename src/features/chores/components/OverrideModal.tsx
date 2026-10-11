import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { cn } from '@/lib/cn.ts';
import { useHouseDetail } from '@/features/houses/hooks.ts';
import { isStateChanged, messageForError } from '../errors.ts';
import { useOverride } from '../hooks.ts';
import { overrideActions } from '../permissions.ts';
import type { Assignment, OverrideAction } from '../types.ts';

const LABELS: Record<OverrideAction, { label: string; hint: string; done: string }> = {
  FORCE_DONE: { label: 'Xác nhận hoàn thành', hint: 'Tính ca này là xong. Hành động được ghi vào nhật ký.', done: 'Đã xác nhận hoàn thành.' },
  FORCE_REJECT: { label: 'Yêu cầu làm lại', hint: 'Đưa ca về trạng thái làm lại kèm lý do.', done: 'Đã yêu cầu làm lại.' },
  REASSIGN: { label: 'Giao cho người khác', hint: 'Chuyển ca sang một người còn ở trong nhà.', done: 'Đã giao lại ca.' },
  CANCEL: { label: 'Hủy ca', hint: 'Ca này không còn cần làm nữa.', done: 'Đã hủy ca.' },
};
const MIN_REASON = 5;
const MAX_REASON = 200;

function OverrideBody({
  assignment,
  houseId,
  meUserId,
  onClose,
}: {
  assignment: Assignment;
  houseId: string;
  meUserId: string | undefined;
  onClose: () => void;
}) {
  const actions = overrideActions(assignment, { isAdmin: true, meUserId });
  const [action, setAction] = useState<OverrideAction | null>(actions[0] ?? null);
  const [reason, setReason] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const override = useOverride(houseId);
  const detail = useHouseDetail(houseId);

  const members = (detail.data?.members ?? []).filter((m) => m.userId !== assignment.assigneeUserId);
  const trimmed = reason.trim();
  const valid = !!action && trimmed.length >= MIN_REASON && trimmed.length <= MAX_REASON && (action !== 'REASSIGN' || !!userId);

  const submit = () => {
    if (!action || !valid) return;
    setError(null);
    override.mutate(
      { assignmentId: assignment.id, action, reason: trimmed, userId: action === 'REASSIGN' ? userId : undefined },
      {
        onSuccess: () => {
          toast(LABELS[action].done);
          onClose();
        },
        onError: (e) => {
          if (isStateChanged(e)) {
            toast('Ca này vừa được xử lý, mình đã tải lại.');
            onClose();
          } else setError(messageForError(e));
        },
      },
    );
  };

  if (actions.length === 0) {
    return <p className="text-sm text-ink-2">Ca này không còn hành động nào để can thiệp.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Hành động" className="flex flex-col gap-2">
        {actions.map((a) => (
          <button
            key={a}
            type="button"
            role="radio"
            aria-checked={action === a}
            onClick={() => setAction(a)}
            className={cn(
              'rounded-btn border px-3.5 py-2.5 text-left focus-visible:outline-none focus-visible:shadow-focus',
              action === a ? 'border-[1.5px] border-ink bg-hl-soft' : 'border-line-2 bg-surface hover:bg-paper',
            )}
          >
            <span className="block text-sm font-semibold text-ink">{LABELS[a].label}</span>
            <span className="block text-cap text-ink-2">{LABELS[a].hint}</span>
          </button>
        ))}
      </div>

      {action === 'REASSIGN' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="override-user" className="text-sm font-medium text-ink">
            Giao cho
          </label>
          <select
            id="override-user"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="h-12 rounded-btn border border-line-2 bg-surface px-3.5 text-b text-ink focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none"
          >
            <option value="">Chọn một người…</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="override-reason" className="text-sm font-medium text-ink">
          Lý do (ghi vào nhật ký)
        </label>
        <textarea
          id="override-reason"
          value={reason}
          rows={3}
          maxLength={MAX_REASON}
          onChange={(e) => setReason(e.target.value)}
          placeholder="VD: Đã xem lại ảnh, bạn đã làm xong"
          className="w-full resize-none rounded-btn border border-line-2 bg-surface px-3.5 py-3 text-b text-ink placeholder:text-ink-3 focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none"
        />
        <p className="text-right font-mono text-cap text-ink-2">
          {trimmed.length}/{MAX_REASON} · tối thiểu {MIN_REASON} ký tự
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {error}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={override.isPending}>
          Để sau
        </Button>
        <Button variant="accent" disabled={!valid} loading={override.isPending} onClick={submit}>
          Thực hiện
        </Button>
      </div>
    </div>
  );
}

/** Trưởng phòng can thiệp từng ca (spec §6.4, S-56). Mọi hành động đều ghi nhật ký. */
export function OverrideModal({
  assignment,
  houseId,
  meUserId,
  onClose,
}: {
  assignment: Assignment | null;
  houseId: string;
  meUserId: string | undefined;
  onClose: () => void;
}) {
  return (
    <Modal open={!!assignment} onClose={onClose} title="Can thiệp ca trực" description={assignment && assignment.choreTitle}>
      {assignment && <OverrideBody key={assignment.id} assignment={assignment} houseId={houseId} meUserId={meUserId} onClose={onClose} />}
    </Modal>
  );
}
