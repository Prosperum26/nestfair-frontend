import { describe, expect, it } from 'vitest';
import { bankLabel } from '@/lib/banks.ts';
import { daysLeft, firstName, formatDayOverline, greeting } from '@/lib/date.ts';
import { pickCurrentHouse } from './current-house.ts';
import { sanitizeInviteCode } from './invite-code.ts';
import { rulesLines } from './rules.ts';
import { createHouseSchema, houseInfoSchema, rulesSchema } from './schemas.ts';
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

describe('houseInfoSchema', () => {
  const ok = { name: ' Nhà 12B ', address: ' Hẻm 51 ', maxMembers: 4 };

  it('cắt khoảng trắng, địa chỉ rỗng giữ chuỗi rỗng để backend xóa', () => {
    expect(houseInfoSchema(2).parse(ok)).toEqual({ name: 'Nhà 12B', address: 'Hẻm 51', maxMembers: 4 });
    expect(houseInfoSchema(2).parse({ ...ok, address: '  ' }).address).toBe('');
  });

  it('số người tối đa không thấp hơn số người đang ở', () => {
    const r = houseInfoSchema(3).safeParse({ ...ok, maxMembers: 2 });
    expect(r.error?.issues[0].message).toBe('Nhà đang có 3 người, số người tối đa không thể thấp hơn.');
    expect(houseInfoSchema(3).safeParse({ ...ok, maxMembers: 3 }).success).toBe(true);
  });

  it('tên quá ngắn, quá 10 người', () => {
    expect(houseInfoSchema(1).safeParse({ ...ok, name: 'A' }).success).toBe(false);
    expect(houseInfoSchema(1).safeParse({ ...ok, maxMembers: 11 }).success).toBe(false);
  });
});

describe('rulesSchema', () => {
  it('cắt khoảng trắng hai đầu, rỗng được phép (xóa nội quy)', () => {
    expect(rulesSchema.parse({ rules: '  1. Giữ yên lặng  ' }).rules).toBe('1. Giữ yên lặng');
    expect(rulesSchema.parse({ rules: '   ' }).rules).toBe('');
  });

  it('tối đa 1000 ký tự', () => {
    expect(rulesSchema.safeParse({ rules: 'a'.repeat(1000) }).success).toBe(true);
    expect(rulesSchema.safeParse({ rules: 'a'.repeat(1001) }).error?.issues[0].message).toBe('Nội quy tối đa 1000 ký tự.');
  });
});

describe('rulesLines', () => {
  it('mỗi dòng một điều, bỏ số thứ tự gõ tay và dòng trống', () => {
    expect(rulesLines('1. Giữ yên lặng sau 23h\n\n2) Rửa chén ngay\n  Không hút thuốc ')).toEqual([
      'Giữ yên lặng sau 23h',
      'Rửa chén ngay',
      'Không hút thuốc',
    ]);
  });

  it('không có nội quy thì rỗng', () => {
    expect(rulesLines(null)).toEqual([]);
    expect(rulesLines('  \n ')).toEqual([]);
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

  it('số ngày còn lại làm tròn lên, hết hạn thì 0', () => {
    const now = new Date('2026-10-08T12:00:00Z');
    expect(daysLeft('2026-10-14T13:00:00Z', now)).toBe(7);
    expect(daysLeft('2026-10-14T11:00:00Z', now)).toBe(6);
    expect(daysLeft('2026-10-08T11:00:00Z', now)).toBe(0);
  });
});

describe('bankLabel', () => {
  it.each([
    ['970407', '0123', 'TCB ·0123'],
    ['970436', '4456', 'VCB ·4456'],
    ['999999', '1111', '999999 ·1111'],
    [null, null, null],
    ['970407', null, null],
  ])('%s + %s -> %s', (bin, last4, expected) => {
    expect(bankLabel(bin, last4)).toBe(expected);
  });
});
