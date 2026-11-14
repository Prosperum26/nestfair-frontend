import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import type { HouseMember } from '@/features/houses/types.ts';
import { firstName } from '@/lib/date.ts';
import { membershipErrorMessage } from '../flow.ts';
import { useTransferAdmin } from '../hooks.ts';

/** Trưởng phòng giao quyền cho một thành viên; mình thành thành viên thường. */
export function TransferAdminDialog({ houseId, member, onClose, onDone }: { houseId: string; member: HouseMember; onClose: () => void; onDone?: () => void }) {
  const transfer = useTransferAdmin(houseId);
  const name = firstName(member.fullName);
  return (
    <Modal
      open
      onClose={onClose}
      overline="Chuyển quyền"
      title={`Giao quyền trưởng phòng cho ${name}?`}
      description={`${name} sẽ sửa được nhà, nội quy, việc nhà và xóa thành viên. Bạn trở thành thành viên thường và không tự lấy lại quyền được.`}
    >
      <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="accent"
          loading={transfer.isPending}
          onClick={async () => {
            // mutateAsync: đổi vai trò làm trang của trưởng phòng bị gỡ trước khi HTTP trả về (callback của mutate() bị bỏ qua).
            try {
              await transfer.mutateAsync(member.userId);
              toast(`${name} đã là trưởng phòng.`);
              onClose();
              onDone?.();
            } catch (e) {
              toast.error(membershipErrorMessage(e));
            }
          }}
        >
          Giao quyền
        </Button>
      </div>
    </Modal>
  );
}
