import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { COPY, copyFor, messageForSwapError } from './copy.ts';

/** Các mã lỗi trong bảng 8.7 và 9.3 của spec: mỗi mã phải có một câu tiếng Việt cho người dùng. */
const SPEC_CODES = [
  'SLOT_LOCKED',
  'SLOT_NOT_SWAPPABLE',
  'DUPLICATE_CHORE_SAME_DAY',
  'TARGET_ABSENT',
  'WEEK_MISMATCH',
  'SWAP_TOO_LATE',
  'URGENT_MARKET_ONLY',
  'SWAP_ALREADY_ACCEPTED',
  'SWAP_EXPIRED',
  'SWAP_NOT_PENDING',
  'SWAP_TARGET_COOLDOWN',
  'SWAP_PENDING_LIMIT',
  'SWAP_DAILY_LIMIT',
  'REWARD_OUT_OF_RANGE',
  'REWARD_NOT_INCREASED',
  'ESCALATE_TOO_LATE',
  'ESCALATE_LIMIT',
  'NO_RESEND_CANDIDATE',
  'NOT_SWAP_TARGET',
  'CANNOT_ACCEPT_OWN',
  'WARNINGS_NOT_ACKNOWLEDGED',
  'WEEK_NOT_GENERATED',
  'WHEEL_NOT_EXCHANGEABLE',
  'PAYBACK_SLOT_LOCKED',
  'SWAP_IDENTICAL_SLOT',
  'COVER_CHAIN_FORBIDDEN',
  'TARGET_LEFT',
  'SWAP_NEEDS_2_MEMBERS',
  'SWAP_SELF',
  'SLOT_CHANGED',
  'NOT_REQUESTER',
  'NOT_CREDITOR',
  'NOT_SLOT_OWNER',
  'IDEMPOTENCY_KEY_REQUIRED',
  'IDEMPOTENCY_KEY_REUSED',
  'PAYBACK_WINDOW_NOT_OPEN',
  'PAYBACK_ALREADY_CHOSEN',
  'PAYBACK_TOO_SOON',
  'PAYBACK_WRONG_WEEK',
  'DEBT_NOT_OPEN',
  'DEBT_NOT_FORGIVABLE',
  'SWAP_PENDING_IN_WEEK',
  'NO_VALID_PAYBACK_SLOT',
];

/** Mã quy tắc hoặc mã lỗi viết hoa không được lọt ra giao diện (spec 8.7). */
const LEAK = /R-SWAP|\bW-\d|\b[A-Z]{3,}(_[A-Z0-9]+)+\b/;

describe('copyFor', () => {
  it('điền tên, việc và ngày vào câu', () => {
    expect(copyFor('DUPLICATE_CHORE_SAME_DAY', { name: 'Hùng', chore: 'Rửa chén' })).toBe('Hùng đã có ca Rửa chén hôm đó.');
    expect(copyFor('TARGET_ABSENT', { name: 'Thiện', date: '25.10' })).toBe('Thiện vắng ngày 25.10.');
    expect(copyFor('SWAP_TARGET_COOLDOWN', { name: 'Mai' })).toBe('Bạn đã gửi cho Mai 2 lần và bị từ chối. Thử lại sau 24 giờ.');
  });

  it('thiếu biến thì không để lại dấu ngoặc nhọn', () => {
    expect(copyFor('DUPLICATE_CHORE_SAME_DAY')).not.toMatch(/[{}]/);
    expect(copyFor('TARGET_ABSENT')).not.toMatch(/[{}]/);
  });

  it('có đủ câu cho mọi mã trong spec và không mã quy tắc nào lọt ra giao diện', () => {
    for (const code of SPEC_CODES) {
      expect(COPY[code], code).toBeTruthy();
      const text = copyFor(code, { name: 'Mai', chore: 'Đổ rác', date: '25.10' });
      expect(text.length, code).toBeGreaterThan(0);
      expect(text, code).not.toMatch(LEAK);
      expect(text, code).not.toMatch(/[{}]/);
    }
  });

  it('một số câu chính xác theo bảng 8.7', () => {
    expect(copyFor('SLOT_LOCKED')).toBe('Ca này đang chờ người khác trả lời.');
    expect(copyFor('SWAP_ALREADY_ACCEPTED')).toBe('Ca đã có người nhận.');
    expect(copyFor('SWAP_EXPIRED')).toBe('Yêu cầu đã hết hạn.');
    expect(copyFor('REWARD_OUT_OF_RANGE')).toBe('Quà từ 1.000đ đến 500.000đ.');
    expect(copyFor('PAYBACK_SLOT_LOCKED')).toBe('Ca làm bù phải tự làm, không chuyển được.');
  });

  it('mã lạ thì trả câu chung, không lộ mã', () => {
    const text = copyFor('SOMETHING_NEW');
    expect(text).not.toMatch(LEAK);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe('messageForSwapError', () => {
  it('ưu tiên câu theo mã lỗi đã biết', () => {
    expect(messageForSwapError(new ApiError(409, 'raw message', 'SWAP_ALREADY_ACCEPTED'))).toBe('Ca đã có người nhận.');
    expect(messageForSwapError(new ApiError(422, 'raw', 'URGENT_MARKET_ONLY'))).toBe('Còn dưới 6 giờ tới hạn, chỉ đăng được lên Chợ ca.');
  });

  it('dùng câu của backend khi mã lạ nhưng câu sạch', () => {
    expect(messageForSwapError(new ApiError(400, 'Lời nhắn tối đa 200 ký tự.', 'VALIDATION'))).toBe('Lời nhắn tối đa 200 ký tự.');
  });

  it('không để câu có mã quy tắc lọt ra giao diện', () => {
    expect(messageForSwapError(new ApiError(422, 'Vi phạm R-SWAP-3', 'WHATEVER'))).not.toMatch(LEAK);
  });

  it('lỗi mạng và lỗi không phải ApiError vẫn có câu tiếng Việt', () => {
    expect(messageForSwapError(new ApiError(0, 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.'))).toContain('Không kết nối');
    expect(messageForSwapError(null)).toBe('Có lỗi xảy ra, thử lại sau.');
  });

  it('FENCE_VIOLATION có câu riêng trong bảng', () => {
    expect(COPY.FENCE_VIOLATION).toBeTruthy();
  });

  it('429 và 5xx của framework (tiếng Anh) hiện câu tiếng Việt, không lộ chữ Anh', () => {
    expect(messageForSwapError(new ApiError(429, 'ThrottlerException: Too Many Requests'))).toBe('Bạn thao tác hơi nhanh, đợi một chút rồi thử lại.');
    expect(messageForSwapError(new ApiError(500, 'Internal server error'))).toBe('Máy chủ đang gặp sự cố, thử lại sau ít phút.');
    expect(messageForSwapError(new ApiError(503, 'Service Unavailable'))).toBe('Máy chủ đang gặp sự cố, thử lại sau ít phút.');
  });
});
