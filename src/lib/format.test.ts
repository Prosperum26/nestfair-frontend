import { describe, expect, it } from 'vitest';
import { formatShortVnd, formatSignedVnd, formatVnd, formatVndInput, parseVndInput } from './format.ts';

describe('formatVnd', () => {
  it.each([
    [0, '0đ'],
    [840000, '840.000đ'],
    [2280000, '2.280.000đ'],
    [999, '999đ'],
    [-170000, '−170.000đ'],
  ])('%i -> %s', (amount, expected) => {
    expect(formatVnd(amount)).toBe(expected);
  });
});

describe('formatSignedVnd (số dư: luôn có dấu, dấu trừ U+2212)', () => {
  it.each([
    [380000, '+380.000đ'],
    [-170000, '−170.000đ'],
    [0, '0đ'],
  ])('%i -> %s', (amount, expected) => {
    expect(formatSignedVnd(amount)).toBe(expected);
  });
  it('không dùng gạch nối ASCII', () => {
    expect(formatSignedVnd(-1)).not.toContain('-');
  });
});

describe('formatShortVnd (nhãn sơ đồ)', () => {
  it.each([
    [170000, '170k'],
    [145000, '145k'],
    [1260000, '1.260k'],
    [33334, '33.334đ'],
    [0, '0đ'],
  ])('%i -> %s', (amount, expected) => {
    expect(formatShortVnd(amount)).toBe(expected);
  });
});

describe('ô nhập tiền', () => {
  it('formatVndInput chèn dấu chấm phân cách nghìn, null thì rỗng', () => {
    expect(formatVndInput(450000)).toBe('450.000');
    expect(formatVndInput(null)).toBe('');
  });
  it.each([
    ['450.000', 450000],
    ['450000', 450000],
    ['1.234.567đ', 1234567],
    ['  12 000 ', 12000],
    ['', null],
    ['abc', null],
    ['0', 0],
  ])('parseVndInput(%j) -> %s', (text, expected) => {
    expect(parseVndInput(text)).toBe(expected);
  });
  it('cắt ở 10 chữ số để không vượt số nguyên an toàn', () => {
    expect(parseVndInput('123456789012345')).toBe(1234567890);
  });
});
