import { describe, expect, it } from 'vitest';
import { autoSlash, isoToVn, vnToIso } from './date-input.ts';

describe('date-input', () => {
  it('isoToVn đổi ngày ISO sang dd/mm/yyyy, giữ nguyên chuỗi dở dang', () => {
    expect(isoToVn('2026-10-12')).toBe('12/10/2026');
    expect(isoToVn('12/1')).toBe('12/1');
    expect(isoToVn('')).toBe('');
  });

  it('vnToIso nhận dd/mm/yyyy (1 chữ số, dấu . hoặc -) và trả lại chuỗi gõ khi chưa đủ', () => {
    expect(vnToIso('12/10/2026')).toBe('2026-10-12');
    expect(vnToIso('2/3/2026')).toBe('2026-03-02');
    expect(vnToIso('12.10.2026')).toBe('2026-10-12');
    expect(vnToIso('12/10/20')).toBe('12/10/20');
  });

  it('autoSlash chèn dấu / khi gõ liền và cắt ở 8 chữ số', () => {
    expect(autoSlash('1')).toBe('1');
    expect(autoSlash('121')).toBe('12/1');
    expect(autoSlash('12102026')).toBe('12/10/2026');
    expect(autoSlash('121020261')).toBe('12/10/2026');
    expect(autoSlash('12/1')).toBe('12/1');
    expect(autoSlash('12/102')).toBe('12/10/2');
    expect(autoSlash('2/3/2026')).toBe('2/3/2026');
  });
});
