import { compressImage } from '@/lib/image-compression.ts';
import { needsConversion, PROOF_ACCEPT, validateCompressed, validateProofImage } from '@/features/chores/image-check.ts';

/** Chuỗi accept cho ô chọn ảnh hóa đơn / bill (gồm HEIC của iPhone, được đổi sang JPEG). */
export const IMAGE_ACCEPT = PROOF_ACCEPT;

/**
 * Kiểm tra rồi nén ảnh về ~1MB trước khi tải lên (cùng quy tắc ảnh check-in việc nhà).
 * Trả về file sẵn sàng gửi, hoặc ném Error có câu tiếng Việt.
 */
export async function prepareImage(file: File): Promise<File> {
  const problem = validateProofImage(file);
  if (problem) throw new Error(problem);
  const convert = needsConversion(file.type);
  let out: File;
  try {
    out = await compressImage(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      ...(convert ? { fileType: 'image/jpeg' } : {}),
    });
  } catch {
    if (convert) throw new Error('Trình duyệt này chưa đọc được ảnh HEIC. Hãy chọn ảnh JPG hoặc PNG.');
    out = file;
  }
  const after = validateCompressed(out);
  if (after) throw new Error(after);
  return out;
}
