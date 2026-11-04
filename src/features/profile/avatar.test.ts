import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_BYTES, checkAvatarFile } from './avatar.ts';

describe('checkAvatarFile', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp'])('nhận %s', (type) => {
    expect(checkAvatarFile({ type, size: 1000 })).toBeNull();
  });

  it('từ chối định dạng khác (gif, svg, pdf)', () => {
    for (const type of ['image/gif', 'image/svg+xml', 'application/pdf', '']) {
      expect(checkAvatarFile({ type, size: 1000 })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');
    }
  });

  it('từ chối file rỗng', () => {
    expect(checkAvatarFile({ type: 'image/png', size: 0 })).toBe('Ảnh bị rỗng, hãy chọn ảnh khác.');
  });

  it('chỉ chặn ảnh gốc quá lớn (20MB) vì sẽ được nén trước khi gửi; 2MB gốc vẫn nhận', () => {
    expect(checkAvatarFile({ type: 'image/jpeg', size: 8 * 1024 * 1024 })).toBeNull();
    expect(checkAvatarFile({ type: 'image/jpeg', size: 21 * 1024 * 1024 })).toBe('Ảnh quá lớn, hãy chọn ảnh dưới 20MB.');
  });

  it('ảnh sau nén phải nằm dưới giới hạn 5MB của backend', () => {
    expect(AVATAR_MAX_BYTES).toBe(5 * 1024 * 1024);
  });
});
