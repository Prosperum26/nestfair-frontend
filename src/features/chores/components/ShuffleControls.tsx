import { Eye, Plus, Shuffle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { messageForError } from '../errors.ts';
import { usePreview, useShuffle } from '../hooks.ts';
import { MAX_REROLLS, shuffleState } from '../shuffle-state.ts';
import type { ScheduleMeta } from '../types.ts';
import { PreviewDialog } from './PreviewDialog.tsx';

/**
 * Nút lịch tuần: "Tạo lịch tuần này" / "Xáo lại (còn N lần)" theo trạng thái, kèm "Xem trước".
 * Xáo lại cần xác nhận vì không hoàn tác được và tốn một trong hai lượt.
 */
export function ShuffleControls({
  houseId,
  weekKey,
  schedule,
  isAdmin,
  inRange,
  hasActivity,
}: {
  houseId: string;
  weekKey: string;
  schedule: ScheduleMeta | null;
  isAdmin: boolean;
  inRange: boolean;
  hasActivity: boolean;
}) {
  const shuffle = useShuffle(houseId);
  const preview = usePreview(houseId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const action = shuffleState({ schedule, isAdmin, inRange, hasActivity });
  const week = weekKey.slice(-2);

  const run = (mode: 'CREATE' | 'REROLL') =>
    shuffle.mutate(
      { weekKey, mode },
      {
        onSuccess: (res) => {
          setConfirmOpen(false);
          if (!res.changed) {
            toast(res.message ?? 'Tuần này đã có lịch.');
            return;
          }
          toast(res.schedule?.relaxed ? 'Đã xếp lịch. Lịch này phải nới rào, xem chi tiết ở phần thông tin lịch.' : `Đã xếp lịch tuần ${week}.`);
        },
        onError: (e) => {
          // Lỗi trong modal hiện tại chỗ; ngoài modal dùng toast.
          if (!confirmOpen) toast(messageForError(e));
        },
      },
    );

  const openPreview = () => {
    setPreviewOpen(true);
    preview.mutate(weekKey);
  };

  if (action.kind === 'HIDDEN' && !inRange) return null;

  return (
    <>
      {inRange && (
        <Button variant="secondary" leftIcon={<Eye />} onClick={openPreview}>
          Xem trước
        </Button>
      )}
      {action.kind === 'CREATE' && (
        <Button variant="accent" leftIcon={<Plus />} loading={shuffle.isPending} onClick={() => run('CREATE')}>
          {action.label}
        </Button>
      )}
      {action.kind === 'REROLL' && (
        <span title={action.tooltip}>
          <Button variant="secondary" leftIcon={<Shuffle />} disabled={!action.enabled} onClick={() => setConfirmOpen(true)}>
            {action.label}
          </Button>
        </span>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => {
          shuffle.reset();
          setConfirmOpen(false);
        }}
        title={`Xáo lại lịch tuần ${week}?`}
        description={`Các ca chưa ai nộp sẽ được xếp lại theo rào công bằng. Mỗi lịch xáo tối đa ${MAX_REROLLS} lần và không hoàn tác được.`}
      >
        {shuffle.isError && (
          <p role="alert" className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
            {messageForError(shuffle.error)}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={() => {
              shuffle.reset();
              setConfirmOpen(false);
            }}
          >
            Để sau
          </Button>
          <Button variant="accent" leftIcon={<Shuffle />} loading={shuffle.isPending} onClick={() => run('REROLL')}>
            Xáo lại lịch
          </Button>
        </div>
      </Modal>

      <PreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        weekKey={weekKey}
        state={{ isPending: preview.isPending, isError: preview.isError, error: preview.error, data: preview.data }}
        onRetry={() => preview.mutate(weekKey)}
      />
    </>
  );
}
