import { ApiError } from '@/lib/api.ts';

/**
 * Câu hiển thị cho từng mã lỗi đổi ca (spec 8.7 và 9.3). Người dùng không bao giờ thấy mã quy tắc hay mã lỗi:
 * mã chỉ để tra câu ở đây. `{name}`, `{chore}`, `{date}` được điền từ `ctx`.
 */
export const COPY: Record<string, string> = {
  // Bảng 8.7
  SLOT_LOCKED: 'Ca này đang chờ người khác trả lời.',
  SLOT_NOT_SWAPPABLE: 'Ca này không đổi được.',
  DUPLICATE_CHORE_SAME_DAY: '{name} đã có ca {chore} hôm đó.',
  TARGET_ABSENT: '{name} vắng ngày {date}.',
  WEEK_MISMATCH: 'Hai ca khác tuần. Hãy nhờ trực dùm hoặc đổi lịch tuần sau.',
  SWAP_TOO_LATE: 'Còn dưới 90 phút tới hạn, không kịp đổi. Hãy tự làm hoặc nhờ trực tiếp.',
  URGENT_MARKET_ONLY: 'Còn dưới 6 giờ tới hạn, chỉ đăng được lên Chợ ca.',
  SWAP_ALREADY_ACCEPTED: 'Ca đã có người nhận.',
  SWAP_EXPIRED: 'Yêu cầu đã hết hạn.',
  SWAP_NOT_PENDING: 'Yêu cầu này không còn hiệu lực.',
  SWAP_TARGET_COOLDOWN: 'Bạn đã gửi cho {name} 2 lần và bị từ chối. Thử lại sau 24 giờ.',
  SWAP_PENDING_LIMIT: 'Bạn đang có 3 yêu cầu chờ. Hãy hủy bớt trước khi gửi thêm.',
  SWAP_DAILY_LIMIT: 'Hôm nay bạn đã gửi 10 yêu cầu.',
  REWARD_OUT_OF_RANGE: 'Quà từ 1.000đ đến 500.000đ.',
  FENCE_VIOLATION: 'Đổi này làm {name} lặp lại việc trong 3 tuần.',
  REWARD_NOT_INCREASED: 'Quà đăng lại phải nhiều hơn lần trước hoặc có lời nhắn mới.',
  ESCALATE_TOO_LATE: 'Còn quá ít thời gian để đăng lại. Bạn có thể tự làm ca này.',
  NO_RESEND_CANDIDATE: 'Không còn ai để gửi thêm. Hãy đăng Chợ ca hoặc tự làm ca này.',
  NOT_SWAP_TARGET: 'Yêu cầu này không gửi cho bạn.',
  CANNOT_ACCEPT_OWN: 'Bạn không thể nhận ca của chính mình.',
  WARNINGS_NOT_ACKNOWLEDGED: 'Hãy đọc và tick xác nhận cảnh báo trước khi gửi.',
  WEEK_NOT_GENERATED: 'Lịch tuần sau chưa có. Thử lại sau 20:00 Chủ Nhật.',
  WHEEL_NOT_EXCHANGEABLE: 'Việc đột xuất chỉ nhờ được bằng quà.',
  PAYBACK_SLOT_LOCKED: 'Ca làm bù phải tự làm, không chuyển được.',
  // Mã còn lại ở bảng 9.3 và các mã backend bổ sung
  ESCALATE_LIMIT: 'Bạn đã đăng lại đủ số lần cho ca này. Hãy tự làm ca này.',
  SWAP_PENDING_IN_WEEK: 'Tuần này còn yêu cầu đổi ca đang chờ. Hãy hủy chúng trước khi xáo lại.',
  NO_VALID_PAYBACK_SLOT: 'Chưa có ca nào phù hợp để làm bù. Hệ thống sẽ thử lại ở tuần sau.',
  SWAP_IDENTICAL_SLOT: 'Hai ca này giống nhau, đổi cũng không thay đổi gì.',
  COVER_CHAIN_FORBIDDEN: 'Ca này bạn đang làm hộ, không nhờ tiếp được.',
  TARGET_LEFT: '{name} đã rời nhà.',
  SWAP_NEEDS_2_MEMBERS: 'Cần ít nhất 2 người trong nhà để đổi ca.',
  SWAP_SELF: 'Bạn không thể gửi yêu cầu cho chính mình.',
  SLOT_CHANGED: 'Ca đã thay đổi nên yêu cầu không còn hiệu lực.',
  NOT_REQUESTER: 'Chỉ người gửi yêu cầu mới làm được việc này.',
  NOT_CREDITOR: 'Chỉ người đã làm hộ mới chọn được ca bù.',
  NOT_SLOT_OWNER: 'Đây không phải ca của bạn.',
  IDEMPOTENCY_KEY_REQUIRED: 'Thiếu mã chống gửi trùng. Hãy thử lại.',
  IDEMPOTENCY_KEY_REUSED: 'Mã chống gửi trùng này đã dùng cho một lựa chọn khác. Hãy thử lại.',
  PAYBACK_WINDOW_NOT_OPEN: 'Chưa tới lúc chọn ca bù.',
  PAYBACK_ALREADY_CHOSEN: 'Bạn đã chọn ca bù cho khoản nợ này rồi.',
  PAYBACK_TOO_SOON: 'Ca này quá gần hạn, người kia không kịp làm bù.',
  PAYBACK_WRONG_WEEK: 'Chỉ chọn được ca ở tuần sau của khoản nợ.',
  DEBT_NOT_OPEN: 'Khoản nợ này đã được xử lý.',
  DEBT_NOT_FORGIVABLE: 'Ca bù đã được làm nên không tha nợ được nữa.',
};

const GENERIC = 'Có lỗi xảy ra, thử lại sau.';
const TOO_FAST = 'Bạn thao tác hơi nhanh, đợi một chút rồi thử lại.';
const SERVER_DOWN = 'Máy chủ đang gặp sự cố, thử lại sau ít phút.';
const DEFAULTS = { name: 'Người này', chore: 'việc này', date: 'đã chọn' };

export interface CopyContext {
  name?: string;
  chore?: string;
  /** "dd.mm". */
  date?: string;
}

/** Mã quy tắc (R-SWAP-3, W-1) hoặc mã lỗi viết hoa (SLOT_LOCKED): không được hiện ra giao diện. */
const LEAK = /R-SWAP|\bW-\d|\b[A-Z]{3,}(_[A-Z0-9]+)+\b/;

const fill = (template: string, ctx: CopyContext = {}) =>
  template.replace(/\{(name|chore|date)\}/g, (_, key: keyof CopyContext) => ctx[key] ?? DEFAULTS[key]);

/** Câu hiển thị cho một mã lỗi. Mã lạ thì trả câu chung, không lộ mã. */
export function copyFor(code: string, ctx?: CopyContext): string {
  const template = COPY[code];
  return template ? fill(template, ctx) : GENERIC;
}

/**
 * Câu cho người dùng từ một lỗi API. Mã đã biết dùng câu ở bảng trên; riêng câu có chỗ điền (tên, ngày) thì ưu tiên
 * câu backend đã điền sẵn nếu nó sạch. Mã lạ dùng câu backend khi không lộ mã quy tắc.
 */
export function messageForSwapError(error: unknown, ctx?: CopyContext): string {
  if (error instanceof ApiError) {
    // Lỗi của framework (throttler, 5xx) có chữ tiếng Anh và không mang mã nghiệp vụ.
    if (!error.code && error.statusCode === 429) return TOO_FAST;
    if (!error.code && error.statusCode >= 500) return SERVER_DOWN;
    const clean = !LEAK.test(error.message) ? error.message : null;
    if (error.code && COPY[error.code]) {
      const hasSlots = /\{(name|chore|date)\}/.test(COPY[error.code]);
      return hasSlots && clean ? clean : copyFor(error.code, ctx);
    }
    return clean ?? GENERIC;
  }
  if (error instanceof Error && !LEAK.test(error.message)) return error.message;
  return GENERIC;
}
