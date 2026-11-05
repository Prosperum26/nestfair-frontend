import { ArrowLeftRight, RotateCw } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { Skeleton } from '@/components/ui/Skeleton.tsx';
import { useHouseDetail } from '@/features/houses/hooks.ts';
import { useHouseStore } from '@/stores/house-store.ts';
import { leaveBlocker, membershipErrorMessage } from '../flow.ts';
import { useLeaveHouse, useLeavePreview } from '../hooks.ts';
import { OptionCard } from './OptionCard.tsx';

/**
 * Rời nhà (mọi vai trò). Chỉ rời được khi số dư bằng 0 và không phải người cuối cùng.
 * Trưởng phòng phải chọn người nhận quyền ngay trong hộp thoại.
 */
export function LeaveHouseDialog({ houseId, houseName, meId, onClose }: { houseId: string; houseName: string; meId: string; onClose: () => void }) {
  const navigate = useNavigate();
  const selectHouse = useHouseStore((s) => s.selectHouse);
  const preview = useLeavePreview(houseId, meId);
  const detail = useHouseDetail(houseId);
  const leave = useLeaveHouse(houseId);
  const [newAdmin, setNewAdmin] = useState<string | null>(null);

  const loading = preview.isPending || detail.isPending;
  const failed = preview.isError || detail.isError;
  const blocker = preview.data ? leaveBlocker(preview.data) : null;
  const isAdmin = preview.data?.role === 'ADMIN';
  const others = detail.data?.members.filter((m) => m.userId !== meId) ?? [];

  return (
    <Modal open onClose={onClose} overline="Rời nhà" title={`Rời ${houseName}?`}>
      {loading ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Đang kiểm tra">
          <Skeleton className="h-14 rounded-btn" />
          <Skeleton className="h-11 rounded-btn" />
        </div>
      ) : failed ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-tom">Không kiểm tra được số dư của bạn.</p>
          <Button variant="secondary" leftIcon={<RotateCw />} onClick={() => void Promise.all([preview.refetch(), detail.refetch()])}>
            Thử lại
          </Button>
        </div>
      ) : blocker ? (
        <div className="flex flex-col gap-5">
          <p className="rounded-btn border border-tom-border bg-tom-bg px-4 py-3 text-sm text-tom">{blocker.message}</p>
          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {blocker.code === 'HAS_BALANCE' && (
              <Button
                variant="accent"
                leftIcon={<ArrowLeftRight />}
                onClick={() => {
                  selectHouse(houseId);
                  onClose();
                  void navigate('/payments');
                }}
              >
                Tới Thanh toán
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink">
            <li>Bạn không còn xem được lịch trực, chi tiêu và trợ lý của nhà này.</li>
            {(preview.data?.futureShifts ?? 0) > 0 && <li>{preview.data?.futureShifts} ca sắp tới của bạn được hệ thống chia cho người khác.</li>}
            <li>Lịch sử chi tiêu và việc nhà của bạn vẫn được giữ cho cả nhà.</li>
            <li>Muốn quay lại, nhờ trưởng phòng gửi mã mời mới.</li>
          </ul>

          {isAdmin && (
            <div className="flex flex-col gap-2.5">
              <p className="text-sm font-medium text-ink">Bạn là trưởng phòng. Chọn người nhận quyền trước khi rời:</p>
              <div role="radiogroup" aria-label="Trưởng phòng mới" className="flex flex-col gap-2.5">
                {others.map((m) => (
                  <OptionCard key={m.userId} checked={newAdmin === m.userId} onSelect={() => setNewAdmin(m.userId)} title={m.fullName} />
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={onClose}>
              Ở lại
            </Button>
            <Button
              variant="danger"
              disabled={isAdmin && !newAdmin}
              loading={leave.isPending}
              onClick={async () => {
                // mutateAsync: member:left tới qua socket trước khi HTTP trả về và có thể gỡ hộp thoại này.
                try {
                  await leave.mutateAsync(newAdmin ?? undefined);
                  toast(`Bạn đã rời ${houseName}.`);
                  onClose();
                  void navigate('/dashboard', { replace: true });
                } catch (e) {
                  toast.error(membershipErrorMessage(e));
                }
              }}
            >
              Rời nhà
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
