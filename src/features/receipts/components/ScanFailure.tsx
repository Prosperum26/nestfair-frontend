import { Camera, PenLine, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { IconTile } from '@/components/ui/IconTile.tsx';
import { ReceiptImagePanel } from './ReceiptImagePanel.tsx';

/**
 * Không quét được (ảnh mờ, không phải hóa đơn, hết hạn mức, Gemini lỗi hoặc quá 10 giây): nói rõ nguyên nhân
 * và mở đường nhập tay. Không bao giờ là màn trống hay lỗi chung chung.
 */
export function ScanFailure({
  previewUrl,
  fileName,
  sizeBytes,
  message,
  onRetry,
  onManual,
}: {
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
  message: string;
  onRetry: () => void;
  onManual: () => void;
}) {
  return (
    <div className="mx-auto grid max-w-[900px] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <ReceiptImagePanel previewUrl={previewUrl} fileName={fileName} sizeBytes={sizeBytes} />
      <section className="rounded-card border border-line bg-surface p-6" role="alert">
        <IconTile icon={<TriangleAlert />} tone="tom" size={44} />
        <h2 className="mt-4 font-display text-ct text-ink">Chưa đọc được hóa đơn</h2>
        <p className="mt-2 text-sm text-ink">{message}</p>
        <div className="mt-5 flex flex-col gap-3">
          <Button variant="accent" leftIcon={<PenLine />} onClick={onManual} fullWidth>
            Nhập tay
          </Button>
          <Button variant="secondary" leftIcon={<Camera />} onClick={onRetry} fullWidth>
            Chụp lại
          </Button>
        </div>
      </section>
    </div>
  );
}
