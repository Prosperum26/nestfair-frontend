import { ApiError } from '@/lib/api.ts';

const MESSAGES: Record<string, string> = {
  WHEEL_BUSY: 'Đang có một vòng quay khác, mình mở cho bạn xem nhé.',
  WHEEL_NEEDS_2_ELIGIBLE: 'Cần ít nhất 2 người để quay. Mời thêm bạn bằng mã mời nhé!',
  PARTICIPANT_NOT_MEMBER: 'Có người không còn ở trong nhà, mình tải lại danh sách nhé.',
  PARTICIPANT_ABSENT: 'Có người đang vắng hôm nay nên không tham gia được.',
  PARTICIPANT_DUPLICATE: 'Danh sách người tham gia bị trùng.',
  WHEEL_HOUSE_BREAK: 'Cả nhà đang nghỉ hôm nay nên không quay được.',
  WHEEL_DUE_INVALID: 'Hạn chót phải cách bây giờ từ 30 phút đến 48 giờ.',
  WHEEL_RATE_LIMIT: 'Nhà đã quay nhiều lần rồi, nghỉ tay chút nhé (tối đa 5 vòng/giờ, 10 vòng/ngày).',
  ASSIGNMENT_STATE_CHANGED: 'Ca này đã được nộp hoặc đã hủy rồi.',
  ADMIN_ONLY: 'Chỉ trưởng phòng mới hủy được vòng quay.',
};

export function wheelErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error instanceof ApiError && error.statusCode === 0) return 'Mất kết nối. Bấm Quay lại để thử tiếp, kết quả không bị quay hai lần.';
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra, thử lại sau.';
}

/** Lỗi mạng (chưa chắc server đã nhận): thử lại với cùng Idempotency-Key. */
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.statusCode === 0;
}
