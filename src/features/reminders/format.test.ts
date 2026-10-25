import { describe, expect, it } from 'vitest';
import { isoFromLocalInput, nextReminders, reminderWhen, sourceLabel, vnTime } from './format.ts';
import type { ReminderDto } from './types.ts';

/**
 * Mốc now cố định: 2026-10-25T03:00:00Z = 10:00 Chủ nhật 25.10.2026 giờ VN.
 * Mọi thời điểm đều dựng bằng chuỗi UTC/offset tuyệt đối nên bộ test không phụ thuộc múi giờ máy;
 * chạy thêm dưới TZ khác (vd. TZ=America/New_York) phải ra cùng kết quả.
 */
const NOW = new Date('2026-10-25T03:00:00Z');

const reminder = (over: Partial<ReminderDto>): ReminderDto => ({
  id: 'r1',
  houseId: 'h1',
  title: 'Đổ rác',
  remindAt: '2026-10-26T02:00:00+07:00',
  source: 'USER',
  sentAt: null,
  ...over,
});

describe('reminderWhen', () => {
  it('cùng ngày VN → "Hôm nay", giờ 24h', () => {
    expect(reminderWhen('2026-10-25T05:30:00Z', NOW)).toEqual({ time: '12:30', day: 'Hôm nay' });
  });

  it('thuộc ngày VN hôm sau → "Ngày mai", kể cả nửa đêm 00:00', () => {
    expect(reminderWhen('2026-10-26T01:00:00Z', NOW)).toEqual({ time: '08:00', day: 'Ngày mai' });
    expect(reminderWhen('2026-10-25T17:00:00Z', NOW)).toEqual({ time: '00:00', day: 'Ngày mai' });
  });

  it('cuối giờ VN (23:59) vẫn thuộc "Hôm nay" chứ không trừ ngày theo giờ UTC', () => {
    expect(reminderWhen('2026-10-25T16:59:00Z', NOW)).toEqual({ time: '23:59', day: 'Hôm nay' });
  });

  it('cùng năm → "T5 08.10" (thứ T2…T7, CN + dd.mm)', () => {
    expect(reminderWhen('2026-10-08T02:30:00Z', NOW)).toEqual({ time: '09:30', day: 'T5 08.10' });
    expect(reminderWhen('2026-11-08T02:30:00Z', NOW)).toEqual({ time: '09:30', day: 'CN 08.11' });
  });

  it('khác năm → dd.mm.yyyy', () => {
    expect(reminderWhen('2027-01-20T17:30:00Z', NOW)).toEqual({ time: '00:30', day: '21.01.2027' });
  });

  it('qua năm mới mà chỉ là ngày mai → vẫn "Ngày mai" (ưu tiên hơn định dạng ngày)', () => {
    const daoCuoiNam = new Date('2026-12-31T16:00:00Z'); // 23:00 ngày 31.12.2026 giờ VN
    expect(reminderWhen('2027-01-01T00:30:00Z', daoCuoiNam)).toEqual({ time: '07:30', day: 'Ngày mai' });
  });
});

describe('nextReminders', () => {
  const a = reminder({ id: 'a', remindAt: '2026-10-26T10:00:00+07:00' }); // = 03:00Z, tức 10:00 VN 26.10
  const b = reminder({ id: 'b', remindAt: '2026-10-26T03:30:00Z' }); // 10:30 VN 26.10, sau a, nhưng so chuỗi "03:30Z" lại đứng trước "10:00+07:00"
  const sent = reminder({ id: 's', remindAt: '2026-10-25T18:00:00Z', sentAt: '2026-10-25T11:05:00Z' });

  it('bỏ nhắc đã gửi, sắp remindAt tăng dần theo thời điểm tuyệt đối (không so chuỗi)', () => {
    expect(nextReminders([b, sent, a], 5).map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('giới hạn n phần tử; n lớn hơn số nhắc thì lấy hết', () => {
    expect(nextReminders([a, b], 1).map((r) => r.id)).toEqual(['a']);
    expect(nextReminders([a], 5).map((r) => r.id)).toEqual(['a']);
  });

  it('không đổi thứ tự mảng nhập vào', () => {
    const list = [b, a];
    nextReminders(list, 5);
    expect(list.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('sourceLabel', () => {
  it('nhãn nguồn nhắc', () => {
    expect(sourceLabel('ASSISTANT')).toBe('Từ trợ lý');
    expect(sourceLabel('USER')).toBe('Của tôi');
    expect(sourceLabel('SYSTEM')).toBe('Hệ thống');
  });
});

describe('vnTime', () => {
  it('"HH:mm" theo giờ VN từ chuỗi ISO bất kể offset', () => {
    expect(vnTime('2026-10-26T00:00:00+07:00')).toBe('00:00');
    expect(vnTime('2026-10-25T18:30:00Z')).toBe('01:30');
  });
});

describe('isoFromLocalInput', () => {
  it('giá trị datetime-local hợp lệ → ISO +07:00 đúng thời điểm tuyệt đối', () => {
    expect(isoFromLocalInput('2026-10-26T08:05', NOW)).toEqual({ iso: '2026-10-26T08:05:00+07:00', error: null });
    expect(new Date(isoFromLocalInput('2026-10-26T08:05', NOW).iso!).toISOString()).toBe('2026-10-26T01:05:00.000Z');
  });

  it('chấp nhận cả phần giây', () => {
    expect(isoFromLocalInput('2026-10-26T08:05:30', NOW).iso).toBe('2026-10-26T08:05:30+07:00');
  });

  it('thời điểm đã qua hoặc bằng now → error "past" (nhắc phải ở tương lai)', () => {
    expect(isoFromLocalInput('2026-10-25T08:00', NOW)).toEqual({ iso: null, error: 'past' });
    expect(isoFromLocalInput('2026-10-25T10:00', NOW)).toEqual({ iso: null, error: 'past' });
  });

  it('sai dạng hoặc ngày giờ không có thật → error "invalid"', () => {
    expect(isoFromLocalInput('', NOW).error).toBe('invalid');
    expect(isoFromLocalInput('26/10/2026 08:00', NOW).error).toBe('invalid');
    expect(isoFromLocalInput('2026-10-26', NOW).error).toBe('invalid');
    expect(isoFromLocalInput('2026-02-30T08:00', NOW).error).toBe('invalid');
    expect(isoFromLocalInput('2026-10-26T24:05', NOW).error).toBe('invalid');
  });
});
