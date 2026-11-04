import { toBlob } from 'html-to-image';
import { POSTER_HEIGHT, POSTER_WIDTH } from './components/Poster.tsx';
import type { ListingStatus } from './types.ts';

/** Chỉ tin đang đăng mới có liên kết sống; QR của tin nháp hoặc đã đóng là liên kết chết. */
export function canExportPoster(status: ListingStatus | null): boolean {
  return status === 'OPEN';
}

export function posterFilename(slug: string): string {
  return `nestfair-poster-${slug}.png`;
}

/**
 * Safari và mọi trình duyệt iOS (đều là WebKit) thường bỏ sót ảnh/font ở lần xuất đầu tiên (R3),
 * nên xuất hai lần và bỏ lần đầu.
 */
export function needsWarmup(userAgent: string): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Safari\//.test(userAgent) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android/.test(userAgent);
}

/** Các kiểu chữ poster dùng; tải sẵn (kèm ký tự tiếng Việt) để xuất PNG không rơi về font hệ thống. */
const POSTER_FONTS = ['700 84px Fraunces', '700 96px "JetBrains Mono"', '500 30px "JetBrains Mono"', '500 32px Inter', '600 38px Inter'];
const SAMPLE = 'Còn chỗ ở ghép ẠẢÃÂẤẦẨẪẬĂẮẰẲẴẶ Đ ƯỨỪỬỮỰ 0123456789đ';

const EXPORT_OPTIONS = {
  width: POSTER_WIDTH,
  height: POSTER_HEIGHT,
  pixelRatio: 1,
  cacheBust: true,
  backgroundColor: '#1C2333',
} as const;

/**
 * Chụp một nút Poster đúng 1080×1350 (pixelRatio 1) thành PNG. Chờ font và giải mã mọi ảnh trong nút trước khi chụp.
 * Nút phải đang nằm trong DOM và không bị `display:none` (đặt ngoài màn hình bằng `position: fixed; left: -99999px`).
 */
export async function exportPosterPng(node: HTMLElement): Promise<Blob> {
  await Promise.all(POSTER_FONTS.map((font) => document.fonts.load(font, SAMPLE).catch(() => [])));
  await document.fonts.ready;
  await Promise.all(Array.from(node.querySelectorAll('img'), (img) => img.decode().catch(() => undefined)));

  if (needsWarmup(navigator.userAgent)) await toBlob(node, EXPORT_OPTIONS);
  const blob = await toBlob(node, EXPORT_OPTIONS);
  if (!blob) throw new Error('Không tạo được ảnh poster.');
  return blob;
}

/** Tải một Blob về máy bằng thẻ <a download>. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  // Để trình duyệt kịp bắt đầu tải trước khi thu hồi.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
