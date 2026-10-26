import { ShieldCheck } from 'lucide-react';
import { AiConsentDialog } from '@/components/AiConsentDialog.tsx';
import { assistantErrorMessage } from '../errors.ts';
import { useSetAssistantConsent } from '../hooks.ts';

/**
 * Hỏi người dùng có đồng ý gửi nội dung chat tới Google Gemini không (D5). Wrapper của
 * AiConsentDialog dùng chung: "Đồng ý" lưu consent rồi gọi `onAgree` (page tự gửi tiếp tin
 * đang chờ); "Không" (hoặc đóng hộp thoại) chỉ gọi `onDecline` — không lưu gì, không gửi.
 */
export function AssistantConsentDialog({ open, onAgree, onDecline }: { open: boolean; onAgree: () => void; onDecline: () => void }) {
  const setConsent = useSetAssistantConsent();

  return (
    <AiConsentDialog
      open={open}
      overline="Quyền riêng tư · Trợ lý AI"
      title="Gửi nội dung chat cho Google Gemini?"
      mutation={setConsent}
      errorMessage={assistantErrorMessage}
      onAgree={onAgree}
      onDecline={onDecline}
      body={
        <>
          <p className="flex items-start gap-2.5 text-sm text-ink">
            <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-ink-2" aria-hidden />
            <span>
              Để gợi ý cách xử lý, NestFair gửi nội dung bạn trò chuyện tới Google Gemini (một dịch vụ AI bên ngoài). Cuộc trò chuyện chỉ của riêng bạn: người trong nhà không xem được.
            </span>
          </p>
          <p className="text-sm text-ink-2">Trợ lý không tự ghi dữ liệu: gợi ý chỉ là nút bấm, bạn chọn làm thì NestFair mới gọi API như bình thường. Bạn tắt lại được bất cứ lúc nào ở menu tài khoản.</p>
        </>
      }
    />
  );
}
