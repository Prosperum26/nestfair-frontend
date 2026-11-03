import { describe, expect, it } from 'vitest';
import { listingFormSchema } from './schemas.ts';

const valid = {
  locationText: 'Hẻm 51 Linh Trung, Thủ Đức · 5 phút đi bộ tới UIT',
  genderWanted: 'ANY',
  rentPerMonth: 1_200_000,
  otherFees: [
    { name: 'Wifi', amount: 60_000 },
    { name: 'Gửi xe', amount: 100_000 },
  ],
  description: 'Phòng thoáng, có cửa sổ.',
  roommateExpectations: 'Sạch sẽ, về trước 23:30.',
  contactPhone: '0901234567',
  showChoreSchedule: true,
};

const errorsOf = (values: Record<string, unknown>) => {
  const res = listingFormSchema.safeParse({ ...valid, ...values });
  return res.success ? [] : res.error.issues.map((i) => i.path.join('.'));
};

describe('listingFormSchema', () => {
  it('hợp lệ với dữ liệu thiết kế 20', () => {
    expect(errorsOf({})).toEqual([]);
  });

  it('SĐT có khoảng trắng được chuẩn hóa', () => {
    const res = listingFormSchema.safeParse({ ...valid, contactPhone: '0901 234 567' });
    expect(res.success).toBe(true);
    expect(res.data?.contactPhone).toBe('0901234567');
  });

  it('từ chối SĐT sai dạng', () => {
    expect(errorsOf({ contactPhone: '123' })).toEqual(['contactPhone']);
    expect(errorsOf({ contactPhone: '84901234567' })).toEqual(['contactPhone']);
    expect(errorsOf({ contactPhone: '' })).toEqual(['contactPhone']);
  });

  it('địa điểm tối thiểu 3 ký tự sau khi cắt khoảng trắng', () => {
    expect(errorsOf({ locationText: 'ab' })).toEqual(['locationText']);
    expect(errorsOf({ locationText: '   a  ' })).toEqual(['locationText']);
    expect(errorsOf({ locationText: 'x'.repeat(121) })).toEqual(['locationText']);
  });

  it('tối đa 8 khoản phí khác', () => {
    const fee = { name: 'Phí', amount: 10_000 };
    expect(errorsOf({ otherFees: Array(8).fill(fee) })).toEqual([]);
    expect(errorsOf({ otherFees: Array(9).fill(fee) })).toEqual(['otherFees']);
  });

  it('mỗi khoản phí cần tên và số tiền nguyên không âm', () => {
    expect(errorsOf({ otherFees: [{ name: '  ', amount: 1000 }] })).toEqual(['otherFees.0.name']);
    expect(errorsOf({ otherFees: [{ name: 'Wifi', amount: -1 }] })).toEqual(['otherFees.0.amount']);
    expect(errorsOf({ otherFees: [{ name: 'Wifi', amount: 10.5 }] })).toEqual(['otherFees.0.amount']);
  });

  it('tiền thuê từ 1 đến 50.000.000', () => {
    expect(errorsOf({ rentPerMonth: 0 })).toEqual(['rentPerMonth']);
    expect(errorsOf({ rentPerMonth: 50_000_001 })).toEqual(['rentPerMonth']);
    expect(errorsOf({ rentPerMonth: 50_000_000 })).toEqual([]);
    expect(errorsOf({ rentPerMonth: 1_200_000.5 })).toEqual(['rentPerMonth']);
  });

  it('giới hạn độ dài mô tả và mong muốn', () => {
    expect(errorsOf({ description: 'x'.repeat(1001) })).toEqual(['description']);
    expect(errorsOf({ roommateExpectations: 'x'.repeat(501) })).toEqual(['roommateExpectations']);
  });

  it('giới tính chỉ nhận MALE, FEMALE, ANY', () => {
    expect(errorsOf({ genderWanted: 'OTHER' })).toEqual(['genderWanted']);
  });
});

describe('ô tiền để trống', () => {
  it('tiền thuê trống bị báo lỗi ở rentPerMonth', () => {
    expect(errorsOf({ rentPerMonth: null })).toEqual(['rentPerMonth']);
  });

  it('khoản phí chưa nhập số tiền bị báo lỗi ở dòng đó', () => {
    expect(errorsOf({ otherFees: [{ name: 'Wifi', amount: null }] })).toEqual(['otherFees.0.amount']);
  });
});
