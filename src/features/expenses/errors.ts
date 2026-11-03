import { ApiError } from '@/lib/api.ts';

/** Mã lỗi sổ chi, thanh toán và quét hóa đơn (README backend, Issue #9 và #11) → câu tiếng Việt cho người dùng. */
const MESSAGES: Record<string, string> = {
  SPLIT_INVALID: 'Cách chia chưa hợp lệ, kiểm tra lại người chịu phần.',
  SPLIT_SUM_MISMATCH: 'Tổng các phần phải bằng số tiền hóa đơn.',
  NOT_A_HOUSE_MEMBER: 'Người được chọn không còn ở trong nhà.',
  SPENT_AT_IN_FUTURE: 'Ngày chi không được ở tương lai.',
  RECEIPT_URL_INVALID: 'Ảnh hóa đơn chưa tải lên được, hãy chọn lại ảnh.',
  EXPENSE_NOT_FOUND: 'Khoản chi này không còn nữa.',
  EXPENSE_FORBIDDEN: 'Chỉ người trả, người ghi hoặc trưởng phòng mới sửa được khoản này.',
  MEMBER_NOT_FOUND: 'Không tìm thấy thành viên này trong nhà.',
  PAYMENT_INFO_MISSING: 'Người nhận chưa cập nhật tài khoản nhận tiền.',
  SETTLEMENT_SELF: 'Không thể chuyển tiền cho chính mình.',
  SETTLEMENT_AMOUNT_EXCEEDS_DEBT: 'Số tiền vượt quá khoản bạn đang nợ người này.',
  SETTLEMENT_ALREADY_PENDING: 'Bạn đã báo chuyển cho người này rồi, chờ họ xác nhận nhé.',
  SETTLEMENT_NOT_PENDING: 'Giao dịch này đã được xử lý. Mình tải lại cho bạn nhé.',
  SETTLEMENT_NOT_FOUND: 'Giao dịch này không còn nữa.',
  NOT_SETTLEMENT_RECEIVER: 'Chỉ người nhận tiền mới xác nhận được.',
  NOT_SETTLEMENT_PARTY: 'Chỉ người chuyển hoặc người nhận mới hủy được.',
  PROOF_URL_INVALID: 'Ảnh bill chưa tải lên được, hãy chọn lại ảnh.',
  UNSUPPORTED_IMAGE: 'Chỉ nhận ảnh JPG, PNG hoặc WEBP.',
  IMAGE_TOO_LARGE: 'Ảnh tối đa 5MB.',
  UPLOAD_UNAVAILABLE: 'Chưa tải ảnh lên được, thử lại sau ít phút.',
  OCR_QUOTA_EXCEEDED: 'Nhà bạn đã dùng hết 20 lượt quét hôm nay. Bạn nhập tay nhé, mai quét tiếp.',
  OCR_CONSENT_REQUIRED: 'Bạn chưa cho phép gửi ảnh hóa đơn tới Google Gemini. Hãy bật ở menu tài khoản.',
  RECEIPT_SCAN_USED: 'Hóa đơn này đã được ghi vào sổ rồi.',
  RECEIPT_SCAN_NOT_FOUND: 'Bản nháp này không còn nữa, bạn quét lại nhé.',
};

export function ledgerErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code && MESSAGES[error.code]) {
      // Backend ghi rõ số tối đa có thể trả: giữ câu gốc vì có số cụ thể.
      return error.code === 'SETTLEMENT_AMOUNT_EXCEEDS_DEBT' ? error.message : MESSAGES[error.code];
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Có lỗi xảy ra, thử lại sau.';
}

/** Dữ liệu đã đổi ở phía người khác: nên tải lại thay vì chỉ báo lỗi. */
export function isLedgerStale(error: unknown): boolean {
  return error instanceof ApiError && ['SETTLEMENT_NOT_PENDING', 'SETTLEMENT_NOT_FOUND', 'EXPENSE_NOT_FOUND'].includes(error.code ?? '');
}
