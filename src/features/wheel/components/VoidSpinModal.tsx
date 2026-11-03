import { Ban } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import type { Assignment } from '@/features/chores/types.ts';
import { wheelErrorMessage } from '../errors.ts';
import { useVoidSpin } from '../hooks.ts';
import { normalizeTitle } from '../selection.ts';

/** Trưởng phòng hủy vòng quay (gõ sai tên việc…): xác nhận + lý do bắt buộc. */
export function VoidSpinModal({ assignment, onClose, onDone }: { assignment: Assignment | null; onClose: () => void; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const mutation = useVoidSpin();
  const clean = normalizeTitle(reason);
  const error = clean.length < 5 ? 'Lý do cần ít nhất 5 ký tự.' : clean.length > 200 ? 'Lý do tối đa 200 ký tự.' : null;

  const submit = () => {
    setTouched(true);
    if (error || !assignment?.wheelSpinId) return;
    mutation.mutate(
      { spinId: assignment.wheelSpinId, reason: clean },
      {
        onSuccess: () => {
          toast('Đã hủy vòng quay.');
          setReason('');
          setTouched(false);
          onDone();
        },
      },
    );
  };

  return (
    <Modal
      open={!!assignment}
      onClose={onClose}
      overline="Vòng quay · Trưởng phòng"
      title="Hủy vòng quay?"
      description={assignment ? `Ca “${assignment.choreTitle}” sẽ bị hủy. Vòng quay vẫn được tính vào hạn mức và hiện trên bảng tin.` : undefined}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex flex-col gap-4"
      >
        <Field label="Lý do" htmlFor="void-reason" error={touched && error ? error : undefined}>
          <Input id="void-reason" value={reason} maxLength={200} placeholder="Ví dụ: Gõ sai tên việc" invalid={touched && !!error} onChange={(e) => setReason(e.target.value)} />
        </Field>
        {mutation.error && (
          <p role="alert" className="text-sm text-tom">
            {wheelErrorMessage(mutation.error)}
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row-reverse">
          <Button type="submit" leftIcon={<Ban />} loading={mutation.isPending}>
            Hủy vòng quay
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Giữ lại
          </Button>
        </div>
      </form>
    </Modal>
  );
}
