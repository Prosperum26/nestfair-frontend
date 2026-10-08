import { describe, expect, it } from 'vitest';
import { firstName, formatDayOverline, greeting } from '@/lib/date.ts';
import { pickCurrentHouse } from './current-house.ts';
import { sanitizeInviteCode } from './invite-code.ts';
import { createHouseSchema } from './schemas.ts';
import type { HouseSummary } from './types.ts';

const house = (id: string): HouseSummary => ({
  id,
  name: id,
  address: null,
  maxMembers: 4,
  memberCount: 1,
  myRole: 'ADMIN',
});

describe('pickCurrentHouse', () => {
  const houses = [house('a'), house('b')];

  it('giữ nhà đã chọn nếu còn ở đó', () => {
    expect(pickCurrentHouse(houses, 'b')?.id).toBe('b');
  });

  it('nhà đã chọn không còn (đã rời) thì lấy nhà đầu danh sách', () => {
    expect(pickCurrentHouse(houses, 'x')?.id).toBe('a');
    expect(pickCurrentHouse(houses, null)?.id).toBe('a');
  });

  it('chưa ở nhà nào thì null', () => {
    expect(pickCurrentHouse([], 'a')).toBeNull();
  });
});

describe('sanitizeInviteCode', () => {
  it.each([
    ['k7m2qz', 'K7M2QZ'],
    [' K7M 2QZ ', 'K7M2QZ'],
    ['k7m-2qz-extra', 'K7M2QZ'],
    ['!@#', ''],
  ])('"%s" -> "%s"', (input, expected) => {
    expect(sanitizeInviteCode(input)).toBe(expected);
  });
});

describe('createHouseSchema', () => {
  it('địa chỉ để trống thì bỏ qua', () => {
    expect(
      createHouseSchema.parse({ name: ' Nhà 12A ', address: '  ', maxMembers: 4 }),
    ).toEqual({ name: 'Nhà 12A', address: undefined, maxMembers: 4 });
  });

  it('tên quá ngắn', () => {
    const r = createHouseSchema.safeParse({ name: 'A', address: '', maxMembers: 4 });
    expect(r.error?.issues[0].message).toBe('Tên nhà cần từ 2 đến 60 ký tự.');
  });
});

describe('date helpers', () => {
  it('overline đúng định dạng thiết kế', () => {
    expect(formatDayOverline(new Date(2026, 9, 6, 20))).toBe('THỨ BA · 06.10.2026');
  });

  it.each([
    [8, 'Chào buổi sáng'],
    [12, 'Chào buổi trưa'],
    [15, 'Chào buổi chiều'],
    [20, 'Chào buổi tối'],
  ])('%i giờ -> %s', (hour, text) => {
    expect(greeting(new Date(2026, 9, 6, hour))).toBe(text);
  });

  it('tên gọi là từ cuối', () => {
    expect(firstName('Trần Minh Hùng')).toBe('Hùng');
  });
});
