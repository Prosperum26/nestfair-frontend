import { describe, expect, it } from 'vitest';
import { canSpin, formatDue, normalizeTitle, resultAnnouncement, resultHeadline, titleError, toggleParticipant } from './selection.ts';

const members = [
  { id: 'h', absentToday: false },
  { id: 't', absentToday: false },
  { id: 'm', absentToday: true },
];

describe('T-FE-02: chọn người tham gia', () => {
  it('người vắng không chọn được; bỏ / thêm lại được, kể cả chính mình', () => {
    expect(toggleParticipant(['h', 't'], 'm', members)).toEqual(['h', 't']);
    expect(toggleParticipant(['h', 't'], 'h', members)).toEqual(['t']);
    expect(toggleParticipant(['t'], 'h', members)).toEqual(['h', 't']);
  });

  it('dưới 2 người hoặc tên việc sai thì khóa nút Quay', () => {
    expect(canSpin(['h', 't'], 'Mua nước', true)).toBe(true);
    expect(canSpin(['h'], 'Mua nước', true)).toBe(false);
    expect(canSpin(['h', 't'], 'ab', true)).toBe(false);
    expect(canSpin(['h', 't'], 'Mua nước', false)).toBe(false);
  });
});

describe('tên việc', () => {
  it('bỏ ký tự điều khiển và khoảng trắng thừa như server', () => {
    expect(normalizeTitle('  Mua \u0007 nước   bình ')).toBe('Mua nước bình');
  });

  it('3–60 ký tự', () => {
    expect(titleError('')).toBe('Nhập tên việc đột xuất.');
    expect(titleError('ab')).toBe('Tên việc cần từ 3 đến 60 ký tự.');
    expect(titleError('x'.repeat(61))).toBe('Tên việc cần từ 3 đến 60 ký tự.');
    expect(titleError('Thông bồn cầu')).toBeNull();
  });
});

describe('formatDue', () => {
  it('hôm nay / ngày mai / ngày khác', () => {
    const now = new Date(2026, 9, 21, 20, 15);
    expect(formatDue(new Date(2026, 9, 21, 21, 0).toISOString(), now)).toBe('21:00 hôm nay');
    expect(formatDue(new Date(2026, 9, 22, 21, 0).toISOString(), now)).toBe('21:00 ngày mai');
    expect(formatDue(new Date(2026, 9, 23, 8, 5).toISOString(), now)).toBe('23.10 08:05');
  });
});

describe('câu kết quả', () => {
  const quan = { id: 'u-quan', name: 'Nguyễn Minh Quân' };

  it('người khác trúng: dùng tên gọi', () => {
    expect(resultHeadline(quan, 'u-hung')).toBe('Quân đã trúng secret!');
    expect(resultAnnouncement(quan, 'Mua nước bình 20L', 'u-hung')).toBe('Kết quả: Quân đã trúng secret! Mua nước bình 20L');
  });

  it('người xem là người trúng: "Bạn"', () => {
    expect(resultHeadline(quan, 'u-quan')).toBe('Bạn đã trúng secret!');
    expect(resultAnnouncement(quan, 'Mua nước bình 20L', 'u-quan')).toBe('Kết quả: Bạn đã trúng secret! Mua nước bình 20L');
  });
});
