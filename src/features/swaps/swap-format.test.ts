import { describe, expect, it } from 'vitest';
import { pointsLabel, slotLabel, timeLeftLabel, weightDiffLabel } from './swap-format.ts';

const NOW = new Date('2026-10-21T03:00:00Z'); // 10:00 giờ nhà

describe('timeLeftLabel', () => {
  it('hiện số giờ còn lại (làm tròn lên) khi từ 1 giờ trở lên', () => {
    expect(timeLeftLabel(new Date(NOW.getTime() + 46 * 3_600_000), NOW)).toBe('còn 46 giờ');
    expect(timeLeftLabel(new Date(NOW.getTime() + 19 * 3_600_000 - 60_000), NOW)).toBe('còn 19 giờ');
    expect(timeLeftLabel(new Date(NOW.getTime() + 3_600_000), NOW)).toBe('còn 1 giờ');
  });

  it('dưới 1 giờ thì hiện phút', () => {
    expect(timeLeftLabel(new Date(NOW.getTime() + 35 * 60_000), NOW)).toBe('còn 35 phút');
    expect(timeLeftLabel(new Date(NOW.getTime() + 30_000), NOW)).toBe('còn 1 phút');
  });

  it('đã quá hạn', () => {
    expect(timeLeftLabel(new Date(NOW.getTime() - 1000), NOW)).toBe('Đã hết hạn');
    expect(timeLeftLabel(NOW, NOW)).toBe('Đã hết hạn');
  });

  it('nhận chuỗi ISO', () => {
    expect(timeLeftLabel('2026-10-21T05:00:00Z', NOW)).toBe('còn 2 giờ');
  });
});

describe('slotLabel', () => {
  it('"Việc · T4 21.10"', () => {
    expect(slotLabel({ choreTitle: 'Rửa chén buổi tối', occurrenceDate: '2026-10-21' })).toBe('Rửa chén buổi tối · T4 21.10');
    expect(slotLabel({ choreTitle: 'Lau nhà', occurrenceDate: '2026-10-25' })).toBe('Lau nhà · CN 25.10');
  });
});

describe('weightDiffLabel', () => {
  it('dùng dấu + và − (U+2212), không dùng gạch nối', () => {
    expect(weightDiffLabel(1)).toBe('+1');
    expect(weightDiffLabel(-2)).toBe('−2');
    expect(weightDiffLabel(-2)).not.toContain('-');
    expect(weightDiffLabel(0)).toBe('0');
  });
});

describe('pointsLabel', () => {
  it('"3 điểm"', () => {
    expect(pointsLabel(3)).toBe('3 điểm');
    expect(pointsLabel(1)).toBe('1 điểm');
  });
});
