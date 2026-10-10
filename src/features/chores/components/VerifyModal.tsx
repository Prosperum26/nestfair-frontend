import { Check, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/ui/Avatar.tsx';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { avatarToneFor } from '@/components/ui/tones.ts';
import { cn } from '@/lib/cn.ts';
import { useVerify } from '../hooks.ts';
import { canVerify } from '../permissions.ts';
import type { Assignment } from '../types.ts';

const MAX_REASON = 200;

function VerifyBody({
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
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const verify = useVerify(houseId);

  const allowed = canVerify(assignment, meUserId);
  const trimmed = reason.trim();

  const send = (decision: 'APPROVE' | 'REJECT') => {
    setServerError(null);
    verify.mutate(
      { assignmentId: assignment.id, decision, reason: decision === 'REJECT' ? trimmed : undefined },
      {
        onSuccess: () => {
          toast(decision === 'APPROVE' ? 'Đã duyệt ca này.' : 'Đã yêu cầu làm lại.');
          onClose();
        },
        onError: (e) => setServerError(e.message),
      },
    );
  };

  return (
    <>
      <div className="flex items-center gap-2 text-sm text-ink-2">
        <Avatar
          name={assignment.assigneeName}
          src={assignment.assigneeAvatarUrl}
          tone={avatarToneFor(assignment.assigneeUserId)}
          size={24}
        />
        <span>{assignment.assigneeName} đã gửi ảnh minh chứng</span>
      </div>

      {assignment.proofImageUrl && !imageFailed ? (
        <img
          src={assignment.proofImageUrl}
          alt={`Ảnh minh chứng: ${assignment.choreTitle}`}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="mt-3 max-h-[320px] w-full rounded-card border border-line bg-paper-2 object-contain"
        />
      ) : (
        <p className="mt-3 rounded-card bg-paper-2 px-3 py-6 text-center text-sm text-ink-2">{assignment.proofImageUrl ? 'Không tải được ảnh minh chứng.' : 'Chưa có ảnh minh chứng.'}</p>
      )}

      {serverError && (
        <p role="alert" className="mt-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {serverError}
        </p>
      )}

      {!allowed ? (
        <p className="mt-4 rounded-btn-sm bg-paper-2 px-3 py-2 text-sm text-ink-2">
          {assignment.assigneeUserId === meUserId
            ? 'Bạn không thể tự duyệt ca của mình. Hãy nhờ bạn cùng phòng.'
            : 'Ca này không còn ở trạng thái chờ duyệt.'}
        </p>
      ) : rejecting ? (
        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="reject-reason" className="text-sm font-medium text-ink">
            Lý do cần làm lại
          </label>
          <textarea
            id="reject-reason"
            value={reason}
            maxLength={MAX_REASON}
            rows={3}
            onChange={(e) => setReason(e.target.value)}
            placeholder="VD: Ảnh bị mờ, chưa thấy sàn đã lau"
            className={cn(
              'w-full resize-none rounded-btn border border-line-2 bg-surface px-3.5 py-3 text-b text-ink',
              'placeholder:text-ink-3 focus:border-[1.5px] focus:border-ink focus:shadow-focus focus:outline-none',
            )}
          />
          <p className="text-right font-mono text-cap text-ink-2">
            {trimmed.length}/{MAX_REASON}
          </p>
          <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setRejecting(false)} disabled={verify.isPending}>
              Quay lại
            </Button>
            <Button
              leftIcon={<X />}
              disabled={trimmed.length === 0}
              loading={verify.isPending}
              onClick={() => send('REJECT')}
            >
              Gửi yêu cầu làm lại
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button leftIcon={<Check />} loading={verify.isPending} onClick={() => send('APPROVE')}>
            Duyệt
          </Button>
          <Button variant="secondary" disabled={verify.isPending} onClick={() => setRejecting(true)}>
            Làm lại
          </Button>
        </div>
      )}
    </>
  );
}

/** Bạn cùng phòng xem ảnh và duyệt hoặc từ chối. Không có nút duyệt cho ca của chính mình. */
export function VerifyModal({
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
    <Modal
      open={!!assignment}
      onClose={onClose}
      title="Duyệt ca trực"
      description={assignment && `${assignment.choreTitle} · ${assignment.assigneeName}`}
    >
      {assignment && (
        <VerifyBody key={assignment.id} assignment={assignment} houseId={houseId} meUserId={meUserId} onClose={onClose} />
      )}
    </Modal>
  );
}
