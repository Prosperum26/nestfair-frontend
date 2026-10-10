export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export const PROOF_ACCEPT = 'image/jpeg,image/png,image/webp';

const ALLOWED = new Set(PROOF_ACCEPT.split(','));

/** Kiểm tra ảnh minh chứng trước khi gửi (khớp quy tắc backend: jpeg/png/webp, tối đa 5MB). */
export function validateProofImage(file: { type: string; size: number }): string | null {
  if (!ALLOWED.has(file.type)) return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';
  if (file.size > MAX_PROOF_BYTES) return 'Ảnh tối đa 5MB.';
  return null;
}
