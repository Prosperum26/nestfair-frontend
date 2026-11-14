import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { isStateChanged, messageForError } from './errors.ts';

describe('messageForError', () => {
  it('có câu riêng cho từng mã lỗi của check-in và duyệt', () => {
    const cases: [string, string][] = [
      ['PROOF_DUPLICATE', 'Ảnh này đã dùng cho ca khác'],
      ['CHECKIN_NOT_OPEN', 'Chưa tới ngày làm'],
      ['CHECKIN_WINDOW_CLOSED', 'Đã quá hạn nộp ảnh'],
      ['ASSIGNMENT_STATE_CHANGED', 'Đã có người xử lý'],
      ['UNSUPPORTED_IMAGE', 'JPG, PNG hoặc WEBP'],
      ['IMAGE_TOO_LARGE', '5MB'],
      ['UPLOAD_UNAVAILABLE', 'thử lại'],
      ['ASSIGNMENT_DISPUTED', 'trưởng phòng'],
      ['NOT_ASSIGNEE', 'không phải ca của bạn'],
      ['SELF_VERIFY_FORBIDDEN', 'tự duyệt'],
    ];
    for (const [code, fragment] of cases) {
      expect(messageForError(new ApiError(409, 'raw', code)), code).toContain(fragment);
    }
  });

  it('mã lạ hoặc không có mã thì dùng thông điệp backend', () => {
    expect(messageForError(new ApiError(500, 'Máy chủ lỗi'))).toBe('Máy chủ lỗi');
    expect(messageForError(new Error('boom'))).toBe('boom');
    expect(messageForError('x')).toBe('Có lỗi xảy ra, thử lại sau.');
  });
});

describe('isStateChanged', () => {
  it('nhận biết lỗi "ca vừa đổi trạng thái" để tải lại thay vì báo lỗi', () => {
    expect(isStateChanged(new ApiError(409, 'x', 'ASSIGNMENT_STATE_CHANGED'))).toBe(true);
    expect(isStateChanged(new ApiError(409, 'x', 'PROOF_DUPLICATE'))).toBe(false);
    expect(isStateChanged(new Error('x'))).toBe(false);
  });
});
