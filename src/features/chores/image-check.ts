/** Giới hạn của server cho ảnh đã gửi (sau khi nén). */
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
/** Giới hạn cho ảnh gốc chọn từ máy: ảnh camera vài MB vẫn nén được xuống dưới 5MB. */
export const MAX_RAW_BYTES = 25 * 1024 * 1024;

const SERVER_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const CONVERTIBLE_TYPES = ['image/heic', 'image/heif'];

/** Chuỗi `accept` cho ô chọn ảnh: gồm HEIC/HEIF của iPhone (được đổi sang JPEG trước khi gửi). */
export const PROOF_ACCEPT = [...SERVER_TYPES, ...CONVERTIBLE_TYPES].join(',');

const UNSUPPORTED = 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';

/** Ảnh có cần đổi sang JPEG trước khi gửi không (HEIC/HEIF). */
export function needsConversion(type: string): boolean {
  return CONVERTIBLE_TYPES.includes(type);
}

/** Kiểm tra ảnh người dùng vừa chọn, TRƯỚC khi nén. */
export function validateProofImage(file: { type: string; size: number }): string | null {
  if (!SERVER_TYPES.includes(file.type) && !CONVERTIBLE_TYPES.includes(file.type)) return UNSUPPORTED;
  if (file.size > MAX_RAW_BYTES) return 'Ảnh quá lớn, hãy chọn ảnh nhỏ hơn 25MB.';
  return null;
}

/** Kiểm tra ảnh SAU khi nén, đúng quy tắc server: jpeg/png/webp, tối đa 5MB. */
export function validateCompressed(file: { type: string; size: number }): string | null {
  if (!SERVER_TYPES.includes(file.type)) {
    return 'Trình duyệt này chưa đọc được ảnh HEIC. Hãy chụp lại ở định dạng JPG hoặc chọn ảnh khác.';
  }
  if (file.size > MAX_PROOF_BYTES) return 'Ảnh tối đa 5MB.';
  return null;
}
