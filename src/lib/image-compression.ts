import imageCompression, { type Options } from 'browser-image-compression';
// Vite phát file này thành asset cùng origin. Mặc định thư viện nạp lại chính nó cho web worker từ
// cdn.jsdelivr.net, sẽ bị CSP `script-src 'self'` chặn (và là phụ thuộc CDN ngoài không cần thiết).
import libURL from 'browser-image-compression/dist/browser-image-compression.js?url';

/** Nén ảnh trước khi tải lên; web worker dùng bản thư viện tự host. */
export function compressImage(file: File, options: Options): Promise<File> {
  return imageCompression(file, { ...options, libURL });
}
