import { compressImage } from '@/lib/image-compression.ts';
import { AVATAR_MAX_BYTES, checkAvatarFile } from './avatar.ts';

/**
 * Kiểm tra rồi nén ảnh đại diện về cạnh dài 512px, dưới 0.5MB trước khi tải lên.
 * Trả file sẵn sàng gửi, hoặc ném Error có câu tiếng Việt.
 */
export async function prepareAvatar(file: File): Promise<File> {
  const problem = checkAvatarFile(file);
  if (problem) throw new Error(problem);
  let out: File;
  try {
    out = await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 512, useWebWorker: true });
  } catch {
    out = file;
  }
  if (out.size > AVATAR_MAX_BYTES) throw new Error('Ảnh vẫn quá lớn sau khi nén, hãy chọn ảnh khác.');
  return out;
}
