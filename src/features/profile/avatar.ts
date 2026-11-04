/** Giới hạn của backend cho ảnh gửi lên (sau khi nén). */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Ảnh gốc được phép lớn hơn nhiều vì sẽ nén xuống cạnh 512px trước khi gửi. */
const AVATAR_MAX_INPUT_BYTES = 20 * 1024 * 1024;
const ACCEPTED = new Set(['image/jpeg', 'image/png', 'image/webp']);

/** Lỗi hiển thị cho người dùng, hoặc null nếu ảnh dùng được. */
export function checkAvatarFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED.has(file.type)) return 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.';
  if (file.size === 0) return 'Ảnh bị rỗng, hãy chọn ảnh khác.';
  if (file.size > AVATAR_MAX_INPUT_BYTES) return 'Ảnh quá lớn, hãy chọn ảnh dưới 20MB.';
  return null;
}
