import { describe, expect, it } from 'vitest';
import { buildFormDefaults, primaryAction, toListingInput } from './form-state.ts';
import type { Listing } from './types.ts';

const suggestions = { locationText: 'Hẻm 51, Linh Trung, Thủ Đức', contactPhone: '0901234567' };

const listing: Listing = {
  id: 'l1',
  slug: 'x7Kp2QmA',
  status: 'DRAFT',
  closeReason: null,
  locationText: 'Hẻm 12 Linh Trung',
  genderWanted: 'FEMALE',
  rentPerMonth: 1_200_000,
  otherFees: [{ name: 'Wifi', amount: 60_000 }],
  description: 'Phòng thoáng.',
  roommateExpectations: 'Sạch sẽ.',
  contactPhone: '0912345678',
  showChoreSchedule: false,
  photos: [],
  publishedAt: null,
  closedAt: null,
  updatedAt: '2026-11-03T00:00:00.000Z',
};

describe('buildFormDefaults', () => {
  it('chưa có tin: vị trí lấy từ địa chỉ nhà, SĐT từ hồ sơ', () => {
    expect(buildFormDefaults(null, suggestions)).toEqual({
      locationText: 'Hẻm 51, Linh Trung, Thủ Đức',
      genderWanted: 'ANY',
      rentPerMonth: null,
      otherFees: [],
      description: '',
      roommateExpectations: '',
      contactPhone: '0901234567',
      showChoreSchedule: true,
    });
  });

  it('gợi ý trống thì để ô trống', () => {
    const d = buildFormDefaults(null, { locationText: null, contactPhone: null });
    expect(d.locationText).toBe('');
    expect(d.contactPhone).toBe('');
  });

  it('đã có tin: dùng nội dung của tin, không ghi đè bằng gợi ý', () => {
    expect(buildFormDefaults(listing, suggestions)).toEqual({
      locationText: 'Hẻm 12 Linh Trung',
      genderWanted: 'FEMALE',
      rentPerMonth: 1_200_000,
      otherFees: [{ name: 'Wifi', amount: 60_000 }],
      description: 'Phòng thoáng.',
      roommateExpectations: 'Sạch sẽ.',
      contactPhone: '0912345678',
      showChoreSchedule: false,
    });
  });

  it('không dùng lại mảng phí của tin (tránh sửa nhầm cache)', () => {
    const d = buildFormDefaults(listing, suggestions);
    expect(d.otherFees).not.toBe(listing.otherFees);
    expect(d.otherFees[0]).not.toBe(listing.otherFees[0]);
  });
});

describe('primaryAction', () => {
  it.each([
    [null, 'SAVE_DRAFT'],
    ['DRAFT', 'PUBLISH'],
    ['OPEN', 'UPDATE'],
    ['CLOSED', 'REOPEN'],
  ] as const)('%s -> %s', (status, expected) => {
    expect(primaryAction(status)).toBe(expected);
  });
});

describe('toListingInput', () => {
  it('chuẩn hóa SĐT, cắt khoảng trắng và giữ đúng trường của UpsertListingDto', () => {
    const input = toListingInput({
      locationText: '  Hẻm 51  ',
      genderWanted: 'ANY',
      rentPerMonth: 1_200_000,
      otherFees: [{ name: ' Wifi ', amount: 60_000 }],
      description: 'a',
      roommateExpectations: 'b',
      contactPhone: '0901 234 567',
      showChoreSchedule: true,
    });
    expect(input).toEqual({
      locationText: 'Hẻm 51',
      genderWanted: 'ANY',
      rentPerMonth: 1_200_000,
      otherFees: [{ name: 'Wifi', amount: 60_000 }],
      description: 'a',
      roommateExpectations: 'b',
      contactPhone: '0901234567',
      showChoreSchedule: true,
    });
    expect(Object.keys(input)).not.toContain('status');
  });
});
