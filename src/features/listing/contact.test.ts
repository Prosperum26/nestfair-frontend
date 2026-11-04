import { describe, expect, it } from 'vitest';
import { displayPhone, telLink, zaloLink } from './contact.ts';

describe('liên hệ', () => {
  it('link Zalo', () => {
    expect(zaloLink('0901234567')).toBe('https://zalo.me/0901234567');
  });

  it('link gọi', () => {
    expect(telLink('0901234567')).toBe('tel:0901234567');
  });

  it('hiển thị SĐT theo nhóm 4-3-3', () => {
    expect(displayPhone('0901234567')).toBe('0901 234 567');
  });

  it('SĐT đã có khoảng trắng vẫn ra link đúng', () => {
    expect(zaloLink('0901 234 567')).toBe('https://zalo.me/0901234567');
    expect(telLink('0901 234 567')).toBe('tel:0901234567');
    expect(displayPhone('0901 234 567')).toBe('0901 234 567');
  });

  it('chuỗi không đủ 10 số thì hiện nguyên', () => {
    expect(displayPhone('12345')).toBe('12345');
  });
});
