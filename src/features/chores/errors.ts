import { ApiError } from '@/lib/api.ts';

const MESSAGES: Record<string, string> = {
  PROOF_DUPLICATE: 'Ảnh này đã dùng cho ca khác. Hãy chụp một ảnh mới.',
  CHECKIN_NOT_OPEN: 'Chưa tới ngày làm nên chưa nộp ảnh được.',
  CHECKIN_WINDOW_CLOSED: 'Đã quá hạn nộp ảnh cho ca này.',
  ASSIGNMENT_STATE_CHANGED: 'Đã có người xử lý ca này. Mình tải lại cho bạn nhé.',
  UNSUPPORTED_IMAGE: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.',
  IMAGE_TOO_LARGE: 'Ảnh tối đa 5MB.',
  UPLOAD_UNAVAILABLE: 'Chưa tải ảnh lên được, thử lại sau ít phút.',
  ASSIGNMENT_DISPUTED: 'Ca này đang chờ trưởng phòng quyết định nên chưa nộp lại được.',
  NOT_ASSIGNEE: 'Đây không phải ca của bạn.',
  SELF_VERIFY_FORBIDDEN: 'Bạn không thể tự duyệt ca của mình.',
  ADMIN_ONLY: 'Chỉ trưởng phòng mới làm được việc này.',
  WEEK_OUT_OF_RANGE: 'Chỉ có thể tạo lịch cho tuần này hoặc tuần sau.',
  SCHEDULE_LOCKED: 'Tuần này đã bắt đầu nên lịch đã khóa.',
  SCHEDULE_HAS_ACTIVITY: 'Đã có ca được nộp hoặc duyệt nên không xáo lại cả lịch được.',
  REROLL_LIMIT: 'Lịch này đã được xáo lại tối đa 2 lần.',
};

/** Thông điệp tiếng Việt cho người dùng: ưu tiên mã lỗi đã biết, sau đó thông điệp backend. */
export function messageForError(error: unknown): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra, thử lại sau.';
}

/** Ca vừa được người khác xử lý: nên tải lại thay vì chỉ báo lỗi. */
export function isStateChanged(error: unknown): boolean {
  return error instanceof ApiError && error.code === 'ASSIGNMENT_STATE_CHANGED';
}
