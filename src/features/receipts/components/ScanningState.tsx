import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button.tsx';
import { ReceiptImagePanel } from './ReceiptImagePanel.tsx';

/** Đang chờ Gemini: ảnh có "tia quét" chạy dọc. Hủy chỉ bỏ kết quả, không gọi lại. */
export function ScanningState({ previewUrl, fileName, sizeBytes, onCancel }: { previewUrl: string; fileName: string; sizeBytes: number; onCancel: () => void }) {
  return (
    <div className="mx-auto grid max-w-[900px] gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <ReceiptImagePanel previewUrl={previewUrl} fileName={fileName} sizeBytes={sizeBytes} scanning />
      <section className="rounded-card border border-line bg-surface p-6" role="status" aria-live="polite">
        <p className="font-mono text-over uppercase text-ink-2">Gemini Vision</p>
        <h2 className="mt-2 flex items-center gap-2 font-display text-ct text-ink">
          <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden />
          Đang đọc hóa đơn…
        </h2>
        <p className="mt-2 text-sm text-ink-2">Thường mất vài giây. Mình đọc cửa hàng, ngày, từng món và tổng tiền.</p>
        <Button variant="secondary" onClick={onCancel} className="mt-5" fullWidth>
          Hủy
        </Button>
      </section>
    </div>
  );
}
