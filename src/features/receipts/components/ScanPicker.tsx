import { Camera, Check, ImagePlus, PenLine, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { IMAGE_ACCEPT } from '@/features/expenses/image-upload.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { nextConsentStep } from '../consent.ts';
import { OcrConsentDialog } from './OcrConsentDialog.tsx';

const TIPS = ['Chụp thẳng, đủ sáng, không bị rung tay.', 'Thấy rõ cả dòng "Tổng" và các món.', 'Một hóa đơn mỗi ảnh, không bị cắt mất góc.'];

/**
 * Bước chọn ảnh. Lần đầu (hoặc khi chưa đồng ý) bấm chụp sẽ hỏi có gửi ảnh cho Google Gemini không (D13).
 * Sau khi đồng ý, người dùng bấm lại để mở camera: trình duyệt chỉ cho mở hộp chọn file ngay trong lúc bấm,
 * không cho mở sau một lần gọi mạng.
 */
export function ScanPicker({ onPick, onManual, error }: { onPick: (file: File) => void; onManual: () => void; error: string | null }) {
  const consentAt = useAuthStore((s) => s.user?.ocrConsentAt ?? null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);
  const [asking, setAsking] = useState(false);

  const choose = (input: React.RefObject<HTMLInputElement | null>) => {
    if (nextConsentStep(consentAt) === 'ask') setAsking(true);
    else input.current?.click();
  };
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // cho phép chọn lại đúng file đó sau khi lỗi
    if (file) onPick(file);
  };

  return (
    <section className="mx-auto flex max-w-[560px] flex-col items-center rounded-card border border-line bg-surface px-6 py-10 text-center max-sm:px-4">
      <IconTile icon={<Camera />} tone="yellow" size={48} />
      <h2 className="mt-4 font-display text-ct text-ink">Chụp hóa đơn, mình điền sẵn giúp bạn</h2>
      <p className="mt-1.5 max-w-[420px] text-sm text-ink-2">
        Mình đọc cửa hàng, ngày và từng món rồi tạo bản nháp. Khoản chi chỉ được ghi khi bạn kiểm tra và bấm Lưu.
      </p>

      <ul className="mt-6 flex w-full max-w-[420px] flex-col gap-2 text-left text-sm text-ink">
        {TIPS.map((t) => (
          <li key={t} className="flex items-start gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-mint" aria-hidden />
            {t}
          </li>
        ))}
      </ul>

      <input ref={cameraRef} type="file" accept={IMAGE_ACCEPT} capture="environment" className="hidden" onChange={handle} />
      <input ref={libraryRef} type="file" accept={IMAGE_ACCEPT} className="hidden" onChange={handle} />

      {error && (
        <p role="alert" className="mt-5 flex w-full items-start gap-1.5 rounded-btn bg-tom-bg px-3 py-2.5 text-left text-sm text-tom">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="mt-6 flex w-full max-w-[420px] flex-col gap-3">
        <Button variant="accent" size="lg" leftIcon={<Camera />} onClick={() => choose(cameraRef)} fullWidth>
          Chụp ảnh hóa đơn
        </Button>
        <div className="flex gap-3 max-sm:flex-col">
          <Button variant="secondary" leftIcon={<ImagePlus />} onClick={() => choose(libraryRef)} className="sm:flex-1">
            Chọn từ thư viện
          </Button>
          <Button variant="ghost" leftIcon={<PenLine />} onClick={onManual} className="sm:flex-1">
            Nhập tay
          </Button>
        </div>
      </div>

      <p className="mt-5 flex items-center gap-1.5 text-cap text-ink-2">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
        Ảnh được gửi tới Google Gemini để đọc.
      </p>

      <OcrConsentDialog
        open={asking}
        onAgree={() => {
          setAsking(false);
          toast('Đã bật quét hóa đơn. Bấm "Chụp ảnh hóa đơn" để tiếp tục.');
        }}
        onDecline={() => setAsking(false)}
      />
    </section>
  );
}
