import { describe, expect, it } from 'vitest';
import { choreSchema } from './schemas.ts';

describe('choreSchema', () => {
  it('nhận dữ liệu hợp lệ và cắt khoảng trắng đầu/cuối tên việc', () => {
    expect(choreSchema.parse({ title: '  Đổ rác ', weight: 2 })).toEqual({ title: 'Đổ rác', weight: 2 });
  });

  it('tên rỗng hoặc toàn khoảng trắng bị từ chối', () => {
    expect(choreSchema.safeParse({ title: '', weight: 2 }).success).toBe(false);
    expect(choreSchema.safeParse({ title: '    ', weight: 2 }).success).toBe(false);
  });

  it('tên dài quá 60 ký tự bị từ chối, đúng 60 thì được', () => {
    expect(choreSchema.safeParse({ title: 'a'.repeat(61), weight: 2 }).success).toBe(false);
    expect(choreSchema.safeParse({ title: 'a'.repeat(60), weight: 2 }).success).toBe(true);
  });

  it('độ nặng ngoài 1–5 hoặc không nguyên bị từ chối', () => {
    for (const weight of [0, 6, 2.5, -1]) {
      expect(choreSchema.safeParse({ title: 'A', weight }).success, `weight ${weight}`).toBe(false);
    }
    for (const weight of [1, 2, 3, 4, 5]) {
      expect(choreSchema.safeParse({ title: 'A', weight }).success, `weight ${weight}`).toBe(true);
    }
  });
});
