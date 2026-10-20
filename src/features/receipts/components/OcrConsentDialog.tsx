import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { useSetOcrConsent } from '../hooks.ts';

/**
 * Hỏi người dùng có đồng ý gửi ảnh hóa đơn tới Google Gemini không (D13). "Đồng ý" lưu ở server rồi gọi
 * `onAgree`; "Không" (hoặc đóng hộp thoại) chỉ gọi `onDecline` và không lưu gì nên lần sau sẽ hỏi lại.
 */
export function OcrConsentDialog({ open, onAgree, onDecline }: { open: boolean; onAgree: () => void; onDecline: () => void }) {
  const setConsent = useSetOcrConsent();
  const [error, setError] = useState<string | null>(null);

  const decline = () => {
    setError(null);
    onDecline();
  };

  return (
    <Modal open={open} onClose={decline} overline="Quyền riêng tư · Quét hóa đơn" title="Gửi ảnh hóa đơn cho Google Gemini?">
      <div className="mt-4 flex flex-col gap-4">
        <p className="flex items-start gap-2.5 text-sm text-ink">
          <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-ink-2" aria-hidden />
          <span>
            Để đọc hóa đơn, NestFair gửi ảnh bạn chụp tới Google Gemini (một dịch vụ AI bên ngoài). Kết quả chỉ là bản nháp: khoản chi chỉ được ghi vào sổ khi bạn bấm Lưu.
          </span>
        </p>
        <p className="text-sm text-ink-2">Bạn chỉ bật cho chính mình, không ảnh hưởng người khác trong nhà, và tắt lại được bất cứ lúc nào ở menu tài khoản. Chọn "Không" thì bạn vẫn nhập khoản chi bằng tay như bình thường.</p>

        {error && (
          <p role="alert" className="flex items-start gap-1.5 rounded-btn bg-tom-bg px-3 py-2.5 text-sm text-tom">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}

        <div className="flex gap-3 max-sm:flex-col-reverse">
          <Button variant="secondary" onClick={decline} className="sm:flex-1">
            Không
          </Button>
          <Button
            variant="accent"
            loading={setConsent.isPending}
            onClick={() => {
              setError(null);
              setConsent.mutate(true, { onSuccess: onAgree, onError: (e) => setError(ledgerErrorMessage(e)) });
            }}
            className="sm:flex-1"
          >
            Đồng ý
          </Button>
        </div>
      </div>
    </Modal>
  );
}
