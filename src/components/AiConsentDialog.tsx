import { TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button.tsx';
import { Modal } from '@/components/ui/Modal.tsx';

/**
 * Mutation bật đồng ý AI (quét OCR hoặc chat Trợ lý): cùng hình dạng useMutation
 * của useSetOcrConsent / useSetAssistantConsent — mutate(true, callbacks) + isPending.
 */
export interface AiConsentMutation {
  isPending: boolean;
  mutate: (enabled: boolean, options: { onSuccess: () => void; onError: (error: unknown) => void }) => void;
}

/**
 * Hộp thoại đồng ý gửi dữ liệu cho Google Gemini, dùng chung cho mọi tính năng AI:
 * nội dung (tiêu đề, phần giải thích quyền riêng tư) do nơi dùng truyền vào; "Đồng ý" lưu
 * consent ở server rồi gọi `onAgree`; "Không" (hoặc đóng hộp thoại) chỉ gọi `onDecline`
 * và không lưu gì nên lần sau sẽ hỏi lại (D5 / D13).
 */
export function AiConsentDialog({
  open,
  overline,
  title,
  body,
  mutation,
  errorMessage,
  onAgree,
  onDecline,
}: {
  open: boolean;
  /** Dòng mono viết hoa trên tiêu đề ("Quyền riêng tư · Quét hóa đơn"). */
  overline: string;
  title: string;
  /** Phần giải thích quyền riêng tư: dữ liệu gì được gửi, điều gì AI không tự làm. */
  body: ReactNode;
  mutation: AiConsentMutation;
  /** Chuyển lỗi mạng / server thành câu tiếng Việt cho nơi dùng (OCR, Trợ lý có bộ câu riêng). */
  errorMessage: (error: unknown) => string;
  onAgree: () => void;
  onDecline: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  const decline = () => {
    setError(null);
    onDecline();
  };

  return (
    <Modal open={open} onClose={decline} overline={overline} title={title}>
      <div className="mt-4 flex flex-col gap-4">
        {body}

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
            loading={mutation.isPending}
            onClick={() => {
              setError(null);
              mutation.mutate(true, { onSuccess: onAgree, onError: (e) => setError(errorMessage(e)) });
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
