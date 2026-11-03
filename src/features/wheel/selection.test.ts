import { describe, expect, it } from 'vitest';
import { canSpin, formatDue, normalizeTitle, resultAnnouncement, prefillTitle, resultHeadline, titleError, toggleParticipant } from './selection.ts';

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
    const now = new Date('2026-10-21T20:15:00+07:00');
    expect(formatDue('2026-10-21T21:00:00+07:00', now)).toBe('21:00 hôm nay');
    expect(formatDue('2026-10-22T21:00:00+07:00', now)).toBe('21:00 ngày mai');
    expect(formatDue('2026-10-23T08:05:00+07:00', now)).toBe('23.10 08:05');
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

describe('prefillTitle: tên việc điền sẵn từ gợi ý của trợ lý', () => {
  it('gọn khoảng trắng, giữ nguyên tên hợp lệ', () => {
    expect(prefillTitle('  Cọ   WC ')).toBe('Cọ WC');
  });

  it('cắt về tối đa 60 ký tự, không để khoảng trắng thừa ở cuối', () => {
    const out = prefillTitle('Dọn dẹp toàn bộ nhà bếp và lau chùi tủ lạnh sau bữa tiệc cuối tuần của cả phòng');
    expect(out.length).toBeLessThanOrEqual(60);
    expect(out).toBe(out.trim());
  });

  it('ngắn hơn 3 ký tự thì để trống để người dùng tự gõ', () => {
    expect(prefillTitle('WC')).toBe('');
    expect(prefillTitle('')).toBe('');
  });
});
