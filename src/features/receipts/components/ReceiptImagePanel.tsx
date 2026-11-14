import { ImageIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { GridPaper } from '@/components/ui/GridPaper.tsx';
import { cn } from '@/lib/cn.ts';
import { formatFileSize } from '../file-size.ts';

/**
 * Khối ảnh hóa đơn trên nền tối kẻ ô (Design.md ảnh 18) kèm chip tên file và dung lượng.
 * `scanning` thêm "tia quét" chạy dọc ảnh trong lúc chờ Gemini (tắt khi người dùng chọn giảm chuyển động).
 */
export function ReceiptImagePanel({
  previewUrl,
  fileName,
  sizeBytes,
  scanning = false,
  children,
  className,
}: {
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
  scanning?: boolean;
  /** Ghi chú dưới ảnh (vd. "Ô tô vàng là chỗ AI không chắc"). */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden rounded-card bg-ink p-4 lg:min-h-[380px]">
        <GridPaper />
        <div className="relative">
          <img src={previewUrl} alt="Ảnh hóa đơn bạn vừa chọn" className="max-h-[52dvh] max-w-full rounded-[6px] object-contain lg:max-h-[560px]" />
          {scanning && <span className="scan-line pointer-events-none absolute inset-x-0 h-0.5 bg-hl" aria-hidden />}
        </div>
      </div>
      <p className="inline-flex max-w-full items-center gap-2 self-start rounded-full border border-line-2 bg-surface py-1.5 pr-3.5 pl-3 text-cap text-ink">
        <ImageIcon className="size-4 shrink-0 text-ink-2" aria-hidden />
        <span className="truncate font-mono">{fileName}</span>
        <span className="shrink-0 font-mono text-ink-2">· {formatFileSize(sizeBytes)}</span>
      </p>
      {children}
    </div>
  );
}
