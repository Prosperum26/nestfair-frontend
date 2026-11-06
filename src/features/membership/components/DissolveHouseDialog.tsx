import { ArrowLeftRight } from 'lucide-react';
import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { Field } from '@/components/ui/Field.tsx';
import { Input } from '@/components/ui/Input.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { ApiError } from '@/lib/api.ts';
import { dissolveNameMatches, membershipErrorMessage } from '../flow.ts';
import { useDissolveHouse } from '../hooks.ts';

/**
 * Giải tán nhà (trưởng phòng). Việc khó đảo ngược nên phải gõ lại đúng tên nhà; còn nợ thì server từ chối
 * (HAS_BALANCE) và hộp thoại chỉ đường tới Thanh toán.
 */
export function DissolveHouseDialog({ houseId, houseName, onClose }: { houseId: string; houseName: string; onClose: () => void }) {
  const navigate = useNavigate();
  const inputId = useId();
  const dissolve = useDissolveHouse(houseId);
  const [typed, setTyped] = useState('');
  const [balanceBlocked, setBalanceBlocked] = useState(false);
  const matches = dissolveNameMatches(typed, houseName);

  return (
    <Modal open onClose={onClose} overline="Vùng nguy hiểm" title={`Giải tán ${houseName}?`}>
      <div className="flex flex-col gap-5">
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-ink">
          <li>Mọi thành viên rời nhà ngay, không ai xem lại được lịch trực, chi tiêu và trợ lý của nhà này.</li>
          <li>Ca sắp tới, nhắc nhở và nợ ca còn dở được đóng. Tin tìm người ở ghép bị đóng.</li>
          <li>Ảnh minh chứng, hóa đơn và ảnh tin đăng bị xóa vĩnh viễn.</li>
          <li>Mã mời hết hiệu lực. Không hoàn tác được.</li>
        </ul>

        <Field label={`Gõ "${houseName}" để xác nhận`} htmlFor={inputId}>
          <Input
            id={inputId}
            value={typed}
            autoComplete="off"
            onChange={(e) => {
              setTyped(e.target.value);
              setBalanceBlocked(false);
            }}
          />
        </Field>

        {balanceBlocked && (
          <p role="alert" className="rounded-btn border border-tom-border bg-tom-bg px-4 py-3 text-sm text-tom">
            Cả nhà cần thanh toán hết các khoản nợ rồi mới giải tán được.
          </p>
        )}

        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            Giữ nhà
          </Button>
          {balanceBlocked ? (
            <Button
              variant="accent"
              leftIcon={<ArrowLeftRight />}
              onClick={() => {
                onClose();
                void navigate('/payments');
              }}
            >
              Tới Thanh toán
            </Button>
          ) : (
            <Button
              variant="danger"
              disabled={!matches}
              loading={dissolve.isPending}
              onClick={async () => {
                // mutateAsync: house:dissolved tới qua socket trước khi HTTP trả về và có thể gỡ hộp thoại này.
                try {
                  await dissolve.mutateAsync(typed);
                  toast(`Đã giải tán ${houseName}.`, { id: `dissolved-${houseId}` });
                  onClose();
                  void navigate('/dashboard', { replace: true });
                } catch (e) {
                  if (e instanceof ApiError && e.code === 'HAS_BALANCE') setBalanceBlocked(true);
                  else toast.error(membershipErrorMessage(e));
                }
              }}
            >
              Giải tán nhà
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
