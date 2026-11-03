import { ShieldCheck } from 'lucide-react';
import { AiConsentDialog } from '@/components/AiConsentDialog.tsx';
import { ledgerErrorMessage } from '@/features/expenses/errors.ts';
import { useSetOcrConsent } from '../hooks.ts';

/**
 * Hỏi người dùng có đồng ý gửi ảnh hóa đơn tới Google Gemini không (D13). Wrapper của
 * AiConsentDialog dùng chung, giữ nguyên hành vi cũ: "Đồng ý" lưu ở server rồi gọi `onAgree`;
 * "Không" (hoặc đóng hộp thoại) chỉ gọi `onDecline` và không lưu gì nên lần sau sẽ hỏi lại.
 */
export function OcrConsentDialog({ open, onAgree, onDecline }: { open: boolean; onAgree: () => void; onDecline: () => void }) {
  const setConsent = useSetOcrConsent();

  return (
    <AiConsentDialog
      open={open}
      overline="Quyền riêng tư · Quét hóa đơn"
      title="Gửi ảnh hóa đơn cho Google Gemini?"
      mutation={setConsent}
      errorMessage={ledgerErrorMessage}
      onAgree={onAgree}
      onDecline={onDecline}
      body={
        <>
          <p className="flex items-start gap-2.5 text-sm text-ink">
            <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-ink-2" aria-hidden />
            <span>
              Để đọc hóa đơn, NestFair gửi ảnh bạn chụp tới Google Gemini (một dịch vụ AI bên ngoài). Kết quả chỉ là bản nháp: khoản chi chỉ được ghi vào sổ khi bạn bấm Lưu.
            </span>
          </p>
          <p className="text-sm text-ink-2">Bạn chỉ bật cho chính mình, không ảnh hưởng người khác trong nhà, và tắt lại được bất cứ lúc nào ở menu tài khoản. Chọn "Không" thì bạn vẫn nhập khoản chi bằng tay như bình thường.</p>
        </>
      }
    />
  );
}
