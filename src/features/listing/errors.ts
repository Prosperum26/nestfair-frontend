import { ApiError } from '@/lib/api.ts';
import { MAX_PHOTOS_PER_CATEGORY, type MissingItem } from './types.ts';

/** Nhãn nhóm ảnh, đúng thứ tự hiển thị. */
const MISSING_LABELS: Record<MissingItem, string> = {
  PHOTO_BEDROOM: 'Phòng ngủ',
  PHOTO_BATHROOM: 'Phòng vệ sinh',
  PHOTO_LIVING: 'Gian sinh hoạt',
};
const MISSING_ORDER = Object.keys(MISSING_LABELS) as MissingItem[];

/** "Phòng ngủ, Phòng vệ sinh" từ mảng `missing` (bỏ giá trị lạ, giữ thứ tự cố định). */
export function missingLabels(missing: readonly string[]): string {
  return MISSING_ORDER.filter((m) => missing.includes(m))
    .map((m) => MISSING_LABELS[m])
    .join(', ');
}

const MESSAGES: Record<string, string> = {
  HOUSE_FULL: 'Nhà đã đủ người nên chưa đăng hoặc mở lại tin được.',
  PHOTO_LIMIT: `Mỗi nhóm có tối đa ${MAX_PHOTOS_PER_CATEGORY} ảnh. Xóa bớt một ảnh rồi thêm lại nhé.`,
  PHOTO_REQUIRED: 'Tin đang đăng cần ít nhất 1 ảnh mỗi nhóm. Hãy thêm ảnh mới trước khi xóa ảnh này.',
  LISTING_STATUS_INVALID: 'Tin đã đóng không chuyển về nháp được. Bấm Mở lại tin để đăng tiếp.',
  LISTING_NOT_FOUND: 'Nhà bạn chưa có tin. Lưu nháp trước rồi thêm ảnh.',
  UNSUPPORTED_IMAGE: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.',
  IMAGE_TOO_LARGE: 'Ảnh tối đa 5MB.',
  UPLOAD_UNAVAILABLE: 'Chưa tải ảnh lên được, thử lại sau ít phút.',
  ADMIN_ONLY: 'Chỉ trưởng phòng mới chỉnh sửa được tin.',
};

/** Thông điệp tiếng Việt cho người dùng: ưu tiên mã lỗi đã biết, rồi tới mã HTTP, cuối cùng là thông điệp backend. */
export function messageForListingError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'LISTING_INCOMPLETE') {
      const missing = error.details?.missing;
      const names = Array.isArray(missing) ? missingLabels(missing.map(String)) : '';
      return names
        ? `Chưa đăng được, còn thiếu ảnh: ${names}. Mỗi nhóm cần ít nhất 1 ảnh.`
        : 'Chưa đăng được, mỗi nhóm ảnh cần ít nhất 1 ảnh.';
    }
    if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
    if (error.statusCode === 0) return error.message;
    if (error.statusCode === 429) return 'Bạn thao tác hơi nhanh, thử lại sau một lát nhé.';
    if (error.statusCode >= 500) return 'Máy chủ đang gặp sự cố, thử lại sau ít phút.';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra, thử lại sau.';
}
