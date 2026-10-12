import { describe, expect, it } from 'vitest';
import { absenceSchema, breakSchema, choreSchema, settingsSchema } from './schemas.ts';

const ok = { title: 'Đổ rác', weight: 2, frequency: 'WEEKLY', recurrenceDays: [1, 4], dueTime: '21:00', rotationMode: 'WEEK_BLOCK', occurrenceGap: 1 } as const;

describe('choreSchema', () => {
  it('nhận dữ liệu hợp lệ và cắt khoảng trắng đầu/cuối tên việc', () => {
    expect(choreSchema.parse({ ...ok, title: '  Đổ rác ' }).title).toBe('Đổ rác');
  });

  it('tên rỗng/toàn khoảng trắng hoặc dài quá 60 ký tự bị từ chối', () => {
    expect(choreSchema.safeParse({ ...ok, title: '    ' }).success).toBe(false);
    expect(choreSchema.safeParse({ ...ok, title: 'a'.repeat(61) }).success).toBe(false);
    expect(choreSchema.safeParse({ ...ok, title: 'a'.repeat(60) }).success).toBe(true);
  });

  it('độ nặng ngoài 1–5 hoặc không nguyên bị từ chối', () => {
    for (const weight of [0, 6, 2.5, -1]) expect(choreSchema.safeParse({ ...ok, weight }).success, `weight ${weight}`).toBe(false);
  });

  it('WEEKLY phải chọn ít nhất một ngày, DAILY/ADHOC thì không cần', () => {
    const r = choreSchema.safeParse({ ...ok, recurrenceDays: [] });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe('Chọn ít nhất một ngày trong tuần.');
    expect(choreSchema.safeParse({ ...ok, frequency: 'DAILY', recurrenceDays: [] }).success).toBe(true);
    expect(choreSchema.safeParse({ ...ok, frequency: 'ADHOC', recurrenceDays: [] }).success).toBe(true);
  });

  it('ngày lặp ngoài 1–7 và giờ hạn sai định dạng bị từ chối', () => {
    expect(choreSchema.safeParse({ ...ok, recurrenceDays: [8] }).success).toBe(false);
    for (const dueTime of ['25:00', '9:00', '21:60', '']) expect(choreSchema.safeParse({ ...ok, dueTime }).success, dueTime).toBe(false);
    expect(choreSchema.safeParse({ ...ok, dueTime: '00:00' }).success).toBe(true);
    expect(choreSchema.safeParse({ ...ok, dueTime: '23:59' }).success).toBe(true);
  });

  it('occurrenceGap chỉ 1–6', () => {
    expect(choreSchema.safeParse({ ...ok, occurrenceGap: 0 }).success).toBe(false);
    expect(choreSchema.safeParse({ ...ok, occurrenceGap: 7 }).success).toBe(false);
  });
});

describe('absenceSchema / breakSchema', () => {
  it('khoảng ngày hợp lệ, kể cả một ngày', () => {
    expect(absenceSchema.safeParse({ startDate: '2026-10-12', endDate: '2026-10-12' }).success).toBe(true);
    expect(breakSchema.safeParse({ startDate: '2026-10-12', endDate: '2026-10-18', reason: 'Du lịch' }).success).toBe(true);
  });

  it('kết thúc trước bắt đầu bị từ chối với thông báo tiếng Việt', () => {
    const r = absenceSchema.safeParse({ startDate: '2026-10-13', endDate: '2026-10-12' });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].message).toBe('Ngày kết thúc phải sau hoặc trùng ngày bắt đầu.');
  });

  it('ngày không tồn tại hoặc sai định dạng bị từ chối', () => {
    expect(absenceSchema.safeParse({ startDate: '2026-02-30', endDate: '2026-03-01' }).success).toBe(false);
    expect(absenceSchema.safeParse({ startDate: '12/10/2026', endDate: '13/10/2026' }).success).toBe(false);
    expect(absenceSchema.safeParse({ startDate: '', endDate: '' }).success).toBe(false);
  });

  it('lý do tối đa 200 ký tự, rỗng thì coi như không có', () => {
    expect(absenceSchema.safeParse({ startDate: '2026-10-12', endDate: '2026-10-12', reason: 'x'.repeat(201) }).success).toBe(false);
    expect(absenceSchema.parse({ startDate: '2026-10-12', endDate: '2026-10-12', reason: '   ' }).reason).toBeUndefined();
  });
});

describe('settingsSchema', () => {
  it('ân hạn 1–24 giờ, số ca 1–6', () => {
    expect(settingsSchema.safeParse({ choreGraceHours: 3, maxSlotsPerPersonPerDay: 2 }).success).toBe(true);
    expect(settingsSchema.safeParse({ choreGraceHours: 0, maxSlotsPerPersonPerDay: 2 }).success).toBe(false);
    expect(settingsSchema.safeParse({ choreGraceHours: 25, maxSlotsPerPersonPerDay: 2 }).success).toBe(false);
    expect(settingsSchema.safeParse({ choreGraceHours: 3, maxSlotsPerPersonPerDay: 7 }).success).toBe(false);
  });
});
