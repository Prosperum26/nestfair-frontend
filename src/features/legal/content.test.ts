import { describe, expect, it } from 'vitest';
import { CONTACT_EMAIL, contactMailto } from './contact.ts';
import { PRIVACY } from './privacy.ts';
import { TERMS } from './terms.ts';
import { tocOf } from './types.ts';

describe.each([
  ['Điều khoản sử dụng', TERMS],
  ['Chính sách quyền riêng tư', PRIVACY],
])('%s', (_name, doc) => {
  it('có tiêu đề, ngày cập nhật và phần mở đầu', () => {
    expect(doc.title.trim()).not.toBe('');
    expect(doc.updated).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    expect(doc.intro.trim()).not.toBe('');
  });

  it('mỗi mục có id duy nhất (dùng làm neo mục lục) và có nội dung', () => {
    const ids = doc.sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of doc.sections) {
      expect(s.id).toMatch(/^[a-z0-9-]+$/);
      expect(s.title.trim()).not.toBe('');
      expect((s.paragraphs?.length ?? 0) + (s.items?.length ?? 0)).toBeGreaterThan(0);
    }
  });

  it('mục lục đánh số theo thứ tự và khớp từng mục', () => {
    const toc = tocOf(doc);
    expect(toc).toHaveLength(doc.sections.length);
    expect(toc.map((t) => t.number)).toEqual(doc.sections.map((_, i) => i + 1));
    expect(toc.map((t) => t.id)).toEqual(doc.sections.map((s) => s.id));
  });
});

describe('liên hệ', () => {
  it('email liên hệ đúng địa chỉ của nhóm', () => {
    expect(CONTACT_EMAIL).toBe('24520626@gm.uit.edu.vn');
  });

  it('mailto có tiêu đề được mã hóa URL', () => {
    expect(contactMailto('Góp ý NestFair')).toBe('mailto:24520626@gm.uit.edu.vn?subject=G%C3%B3p%20%C3%BD%20NestFair');
  });

  it('mailto không tiêu đề thì chỉ có địa chỉ', () => {
    expect(contactMailto()).toBe('mailto:24520626@gm.uit.edu.vn');
  });
});
