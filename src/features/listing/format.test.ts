import { describe, expect, it } from 'vitest';
import {
  costLines,
  estimateTotal,
  genderLabel,
  genderPosterLine,
  listingHeadline,
  publicUrlDisplay,
} from './format.ts';

describe('estimateTotal (cùng công thức backend)', () => {
  it('thuê + điện nước + phí khác = 1.615.000', () => {
    expect(
      estimateTotal({ rentPerMonth: 1_200_000, utilitiesPerPerson: 255_000, otherFees: [{ amount: 60_000 }, { amount: 100_000 }] }),
    ).toBe(1_615_000);
  });

  it('chưa có điện nước thì không cộng = 1.360.000', () => {
    expect(
      estimateTotal({ rentPerMonth: 1_200_000, utilitiesPerPerson: null, otherFees: [{ amount: 60_000 }, { amount: 100_000 }] }),
    ).toBe(1_360_000);
  });

  it('không có phí khác', () => {
    expect(estimateTotal({ rentPerMonth: 900_000, utilitiesPerPerson: null, otherFees: [] })).toBe(900_000);
  });
});

describe('costLines', () => {
  it('liệt kê tiền thuê, điện nước (TB n tháng), từng khoản khác', () => {
    expect(
      costLines({
        rentPerMonth: 1_200_000,
        utilitiesPerPerson: 255_000,
        utilitiesMonthsUsed: 3,
        otherFees: [
          { name: 'Wifi', amount: 60_000 },
          { name: 'Gửi xe', amount: 100_000 },
        ],
      }),
    ).toEqual([
      { label: 'Tiền thuê', amount: 1_200_000 },
      { label: 'Điện nước (TB 3 tháng)', amount: 255_000 },
      { label: 'Wifi', amount: 60_000 },
      { label: 'Gửi xe', amount: 100_000 },
    ]);
  });

  it('bỏ dòng điện nước khi chưa có dữ liệu', () => {
    expect(
      costLines({ rentPerMonth: 1_200_000, utilitiesPerPerson: null, utilitiesMonthsUsed: null, otherFees: [] }),
    ).toEqual([{ label: 'Tiền thuê', amount: 1_200_000 }]);
  });

  it('tổng các dòng bằng estimateTotal', () => {
    const input = {
      rentPerMonth: 1_200_000,
      utilitiesPerPerson: 255_000,
      utilitiesMonthsUsed: 1,
      otherFees: [{ name: 'Wifi', amount: 60_000 }],
    };
    expect(costLines(input).reduce((s, l) => s + l.amount, 0)).toBe(estimateTotal(input));
  });
});

describe('listingHeadline', () => {
  it.each([
    [1, 'Còn 1 chỗ ở ghép'],
    [2, 'Còn 2 chỗ ở ghép'],
    [0, 'Đã đủ người'],
  ])('%i chỗ -> %s', (slots, expected) => {
    expect(listingHeadline(slots)).toBe(expected);
  });
});

describe('giới tính', () => {
  it('nhãn', () => {
    expect(genderLabel('MALE')).toBe('Nam');
    expect(genderLabel('FEMALE')).toBe('Nữ');
    expect(genderLabel('ANY')).toBe('Không yêu cầu giới tính');
  });

  it('dòng trên poster, ANY thì không có dòng', () => {
    expect(genderPosterLine('MALE')).toBe('Tìm bạn nam');
    expect(genderPosterLine('FEMALE')).toBe('Tìm bạn nữ');
    expect(genderPosterLine('ANY')).toBeNull();
  });
});

describe('publicUrlDisplay', () => {
  it('bỏ giao thức, giữ host/r/slug', () => {
    expect(publicUrlDisplay('http://192.168.1.10:5173/r/x7Kp2QmA')).toBe('192.168.1.10:5173/r/x7Kp2QmA');
    expect(publicUrlDisplay('https://nestfair.vercel.app/r/x7Kp2QmA')).toBe('nestfair.vercel.app/r/x7Kp2QmA');
  });
});
