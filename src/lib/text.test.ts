import { describe, expect, it } from 'vitest';
import { groupAccount, toAsciiUpper, toBankAccountName } from './text.ts';

describe('text', () => {
  it('toAsciiUpper bỏ dấu và viết hoa', () => {
    expect(toAsciiUpper('Đặng Thị Ỷ')).toBe('DANG THI Y');
  });

  it.each([
    ['Nguyễn Minh Quân', 'NGUYEN MINH QUAN'],
    ['  Võ   Văn  Kiệt ', 'VO VAN KIET'],
    ["O'Brien-Nguyễn", 'OBRIENNGUYEN'],
  ])('toBankAccountName(%j) = %j (khớp backend)', (input, expected) => {
    expect(toBankAccountName(input)).toBe(expected);
  });

  it('groupAccount nhóm 4 số', () => {
    expect(groupAccount('0123456789')).toBe('0123 4567 89');
    expect(groupAccount('19036680123')).toBe('1903 6680 123');
    expect(groupAccount('1234')).toBe('1234');
  });
});
