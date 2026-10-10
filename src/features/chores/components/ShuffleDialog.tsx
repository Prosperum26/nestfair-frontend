import { Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { useShuffle } from '../hooks.ts';

/** Xác nhận xếp lại lịch. Ca đã nộp / đã duyệt được giữ nguyên, chỉ ca "Chờ làm" bị xếp lại. */
export function ShuffleDialog({
  open,
  onClose,
  houseId,
  weekKey,
}: {
  open: boolean;
  onClose: () => void;
  houseId: string;
  weekKey: string;
}) {
  const shuffle = useShuffle(houseId);
  const week = weekKey.slice(-2);
  const close = () => {
    shuffle.reset();
    onClose();
  };

  const confirm = () =>
    shuffle.mutate(weekKey, {
      onSuccess: ({ relaxed }) => {
        toast(
          relaxed
            ? 'Lịch tuần này đã nới rào 3 tuần vì không đủ phương án để tránh lặp việc.'
            : `Đã xếp lại lịch tuần ${week}.`,
        );
        close();
      },
    });

  return (
    <Modal
      open={open}
      onClose={close}
      title={`Xếp lại lịch tuần ${week}?`}
      description="Các ca đã nộp ảnh hoặc đã được duyệt được giữ nguyên. Chỉ các ca còn Chờ làm được xếp lại, và không ai làm lại cùng một việc trong 3 tuần liền."
    >
      {shuffle.isError && (
        <p role="alert" className="mb-4 rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {shuffle.error.message}
        </p>
      )}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={close}>
          Để sau
        </Button>
        <Button variant="accent" leftIcon={<Shuffle />} loading={shuffle.isPending} onClick={confirm}>
          Xếp lại lịch
        </Button>
      </div>
    </Modal>
  );
}
