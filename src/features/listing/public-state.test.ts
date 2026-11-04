import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { priceNote, publicViewState, publishedOverline } from './public-state.ts';
import type { PublicListing } from './types.ts';

const open: PublicListing = {
  slug: 'abc',
  status: 'OPEN',
  closeReason: null,
  publishedAt: '2026-10-04T00:00:00.000Z',
  locationText: 'Hẻm 51 Linh Trung',
  genderWanted: 'ANY',
  rentPerMonth: 1_200_000,
  otherFees: [],
  summary: { memberCount: 4, maxMembers: 5, slotsOpen: 1, utilities: null },
  estimatedPerPerson: 1_200_000,
  description: '',
  roommateExpectations: '',
  photos: { BEDROOM: [], BATHROOM: [], LIVING: [] },
  roster: null,
  contact: { phone: '0901234567' },
};
const closed = (closeReason: 'FULL' | 'MANUAL'): PublicListing => ({
  slug: 'abc',
  status: 'CLOSED',
  closeReason,
  locationText: 'Hẻm 51 Linh Trung',
  coverUrl: null,
});

describe('publicViewState', () => {
  it('đang tải và chưa có dữ liệu thì loading', () => {
    expect(publicViewState({ isLoading: true, error: null, data: undefined })).toBe('loading');
  });

  it('có dữ liệu OPEN thì open', () => {
    expect(publicViewState({ isLoading: false, error: null, data: open })).toBe('open');
  });

  it('CLOSED với closeReason FULL thì full', () => {
    expect(publicViewState({ isLoading: false, error: null, data: closed('FULL') })).toBe('full');
  });

  it('CLOSED với closeReason MANUAL thì closed', () => {
    expect(publicViewState({ isLoading: false, error: null, data: closed('MANUAL') })).toBe('closed');
  });

  it('404 LISTING_NOT_FOUND thì notfound', () => {
    const error = new ApiError(404, 'Không tìm thấy', 'LISTING_NOT_FOUND');
    expect(publicViewState({ isLoading: false, error, data: undefined })).toBe('notfound');
  });

  it('lỗi mạng ApiError(0) thì error', () => {
    const error = new ApiError(0, 'Mất kết nối');
    expect(publicViewState({ isLoading: false, error, data: undefined })).toBe('error');
  });

  it('lỗi 500 hoặc lỗi lạ cũng là error, không phải notfound', () => {
    expect(publicViewState({ isLoading: false, error: new ApiError(500, 'Lỗi'), data: undefined })).toBe('error');
    expect(publicViewState({ isLoading: false, error: new Error('boom'), data: undefined })).toBe('error');
  });

  it('làm tươi lỗi mà vẫn còn dữ liệu cũ thì giữ dữ liệu, không nháy sang error', () => {
    const error = new ApiError(0, 'Mất kết nối');
    expect(publicViewState({ isLoading: false, error, data: open })).toBe('open');
  });
});

describe('priceNote', () => {
  const utilities = { avgMonthlyTotal: 1_275_000, perPerson: 255_000, monthsUsed: 3 };

  it('liệt kê tiền thuê, điện nước và từng phí khác, nối bằng "và"', () => {
    const fees = [
      { name: 'Wifi', amount: 60_000 },
      { name: 'Gửi xe', amount: 100_000 },
    ];
    expect(priceNote({ utilities, otherFees: fees })).toBe('Đã gồm tiền thuê, điện nước trung bình, wifi và gửi xe.');
  });

  it('chỉ có tiền thuê thì không có "và"', () => {
    expect(priceNote({ utilities, otherFees: [] })).toBe('Đã gồm tiền thuê và điện nước trung bình.');
  });

  it('chưa có điện nước thì nói rõ là chưa gồm', () => {
    expect(priceNote({ utilities: null, otherFees: [] })).toBe('Đã gồm tiền thuê. Chưa gồm điện nước vì nhà chưa có dữ liệu.');
  });
});

describe('publishedOverline', () => {
  it('ĐĂNG dd.mm.yyyy', () => {
    expect(publishedOverline('2026-10-04T05:00:00.000Z')).toBe('ĐĂNG 04.10.2026');
  });

  it('chưa có ngày đăng hoặc ngày hỏng thì null', () => {
    expect(publishedOverline(null)).toBeNull();
    expect(publishedOverline('không phải ngày')).toBeNull();
  });
});
