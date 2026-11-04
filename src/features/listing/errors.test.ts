import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { messageForListingError } from './errors.ts';

describe('messageForListingError', () => {
  it('có câu riêng cho từng mã lỗi của tin đăng và ảnh', () => {
    const cases: [number, string, string][] = [
      [409, 'HOUSE_FULL', 'đủ người'],
      [422, 'PHOTO_LIMIT', 'tối đa 6 ảnh'],
      [422, 'PHOTO_REQUIRED', 'ít nhất 1 ảnh'],
      [422, 'LISTING_STATUS_INVALID', 'Mở lại'],
      [404, 'LISTING_NOT_FOUND', 'chưa có tin'],
      [415, 'UNSUPPORTED_IMAGE', 'JPG, PNG hoặc WEBP'],
      [413, 'IMAGE_TOO_LARGE', '5MB'],
      [503, 'UPLOAD_UNAVAILABLE', 'thử lại'],
    ];
    for (const [status, code, fragment] of cases) {
      expect(messageForListingError(new ApiError(status, 'raw', code)), code).toContain(fragment);
    }
  });

  it('LISTING_INCOMPLETE liệt kê nhóm ảnh còn thiếu theo missing', () => {
    const all = new ApiError(422, 'raw', 'LISTING_INCOMPLETE', {
      missing: ['PHOTO_BEDROOM', 'PHOTO_BATHROOM', 'PHOTO_LIVING'],
    });
    expect(messageForListingError(all)).toContain('Phòng ngủ, Phòng vệ sinh, Gian sinh hoạt');

    const one = new ApiError(422, 'raw', 'LISTING_INCOMPLETE', { missing: ['PHOTO_LIVING'] });
    const msg = messageForListingError(one);
    expect(msg).toContain('Gian sinh hoạt');
    expect(msg).not.toContain('Phòng ngủ');
  });

  it('LISTING_INCOMPLETE không có missing vẫn ra câu chung', () => {
    expect(messageForListingError(new ApiError(422, 'raw', 'LISTING_INCOMPLETE'))).toContain('ảnh');
  });

  it('mất mạng, 429, 5xx có câu riêng', () => {
    expect(messageForListingError(new ApiError(0, 'Không kết nối được máy chủ.'))).toContain('Không kết nối được');
    expect(messageForListingError(new ApiError(429, 'raw'))).toContain('thử lại sau');
    expect(messageForListingError(new ApiError(500, 'raw'))).toContain('Máy chủ');
    expect(messageForListingError(new ApiError(503, 'raw'))).toContain('Máy chủ');
  });

  it('mã lạ thì dùng thông điệp backend, giá trị lạ thì câu chung', () => {
    expect(messageForListingError(new ApiError(400, 'Vị trí quá ngắn'))).toBe('Vị trí quá ngắn');
    expect(messageForListingError(new Error('boom'))).toBe('boom');
    expect(messageForListingError('x')).toBe('Có lỗi xảy ra, thử lại sau.');
  });
});
