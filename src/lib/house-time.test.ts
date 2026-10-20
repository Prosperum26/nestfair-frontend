import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { activityTime } from '@/features/activity/text.ts';
import { formatDue } from '@/features/wheel/selection.ts';
import { houseClock, houseDayDiff } from './house-time.ts';

// 23:30 giờ VN = 16:30 UTC cùng ngày; 00:30 giờ VN = 17:30 UTC hôm trước.
const VN_2330 = '2026-10-21T16:30:00.000Z';
const VN_0030_NEXT = '2026-10-21T17:30:00.000Z';

describe.each(['UTC', 'Asia/Singapore', 'America/Los_Angeles'])('giờ nhà khi máy người xem ở %s', (tz) => {
  // Đổi múi giờ máy (Node đọc lại `process.env.TZ` mỗi lần gán).
  beforeAll(() => {
    vi.stubEnv('TZ', tz);
  });
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('máy thật sự đang ở múi giờ khác giờ nhà', () => {
    expect(new Date(VN_2330).getHours()).not.toBe(23);
  });

  it('houseClock: giờ và ngày theo Asia/Ho_Chi_Minh, kể cả qua nửa đêm', () => {
    expect(houseClock(VN_2330)).toEqual({ dayKey: '2026-10-21', ddmm: '21.10', hm: '23:30' });
    expect(houseClock(VN_0030_NEXT)).toEqual({ dayKey: '2026-10-22', ddmm: '22.10', hm: '00:30' });
    expect(houseDayDiff(VN_0030_NEXT, VN_2330)).toBe(1);
    expect(houseDayDiff(VN_2330, VN_0030_NEXT)).toBe(-1);
  });

  it('activityTime: so ngày theo giờ nhà', () => {
    expect(activityTime(VN_2330, new Date('2026-10-21T23:45:00+07:00'))).toBe('23:30');
    expect(activityTime(VN_0030_NEXT, new Date('2026-10-22T08:00:00+07:00'))).toBe('00:30');
    // 00:10 giờ VN hôm sau vẫn là cùng ngày UTC với mục 23:30, nhưng với nhà đã sang ngày mới.
    expect(activityTime(VN_2330, new Date('2026-10-22T00:10:00+07:00'))).toBe('21.10 23:30');
  });

  it('formatDue: 00:30 sau nửa đêm giờ VN là "ngày mai"', () => {
    const now = new Date('2026-10-21T23:45:00+07:00');
    expect(formatDue(VN_0030_NEXT, now)).toBe('00:30 ngày mai');
    expect(formatDue('2026-10-21T23:55:00+07:00', now)).toBe('23:55 hôm nay');
    expect(formatDue('2026-10-23T08:05:00+07:00', now)).toBe('23.10 08:05');
  });
});
