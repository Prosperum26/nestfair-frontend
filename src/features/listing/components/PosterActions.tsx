import { Download, ImagePlus } from 'lucide-react';
import { type Ref, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button.tsx';
import { downloadBlob, canExportPoster, exportPosterPng, posterFilename } from '../poster-export.ts';
import type { ListingStatus } from '../types.ts';
import { Poster, POSTER_HEIGHT, POSTER_WIDTH, type PosterProps } from './Poster.tsx';

/**
 * Poster thứ hai đặt NGOÀI màn hình để xuất PNG: không dùng `display:none` hay `visibility:hidden`
 * (trình duyệt sẽ không dựng ảnh/font nên PNG trống). Nút được xuất là `nodeRef` bên trong, không bị `fixed`.
 */
export function PosterExportHost({ nodeRef, ...poster }: PosterProps & { nodeRef: Ref<HTMLDivElement> }) {
  return (
    <div aria-hidden style={{ position: 'fixed', left: '-99999px', top: 0, pointerEvents: 'none' }}>
      <div ref={nodeRef} style={{ width: `${POSTER_WIDTH}px`, height: `${POSTER_HEIGHT}px` }}>
        <Poster {...poster} />
      </div>
    </div>
  );
}

/** Nút "Tải poster PNG" (accent) và "Đổi ảnh bìa"; chỉ tải được khi tin đang đăng. */
export function PosterActions({ status, slug, poster }: { status: ListingStatus | null; slug: string | null; poster: PosterProps }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canExport = canExportPoster(status) && !!slug;

  const download = async () => {
    const node = nodeRef.current;
    if (!node || !slug) return;
    setBusy(true);
    setError(null);
    try {
      downloadBlob(await exportPosterPng(node), posterFilename(slug));
      toast('Đã tạo poster. Ảnh nằm trong thư mục Tải xuống của bạn.');
    } catch {
      setError('Chưa tạo được poster. Bạn thử lại nhé; nếu vẫn lỗi, hãy đăng nhập bằng Chrome hoặc Safari bản mới.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" leftIcon={<Download />} loading={busy} disabled={!canExport} onClick={() => void download()} className="sm:flex-1">
          {busy ? 'Đang tạo ảnh…' : 'Tải poster PNG'}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<ImagePlus />}
          onClick={() => document.getElementById('listing-photos-title')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
        >
          Đổi ảnh bìa
        </Button>
      </div>
      {!canExport && <p className="text-cap text-ink-2">Đăng tin để có liên kết hoạt động, rồi mới tải được poster.</p>}
      {error && (
        <p role="alert" className="rounded-btn-sm bg-tom-bg px-3 py-2 text-sm text-tom">
          {error}
        </p>
      )}
      <PosterExportHost nodeRef={nodeRef} {...poster} />
    </div>
  );
}
