import { describe, expect, it } from 'vitest';
import { PEOPLE } from './debt-demo.ts';
import { advanceTicker, shouldRunTicker, TICKER_EVENTS, TICKER_INTERVAL_MS } from './ticker.ts';

describe('TICKER_EVENTS', () => {
  it('sự kiện đầu khớp ảnh thiết kế: Mai đã duyệt “Rửa chén”', () => {
    expect(TICKER_EVENTS[0]).toMatchObject({ who: 'M', title: 'Mai đã duyệt “Rửa chén”', note: '+10 điểm chăm chỉ cho Hùng' });
  });

  it('mỗi sự kiện của người trong Nhà 12A, tên ở đầu câu, tiền là số nguyên dương, không emoji', () => {
    expect(TICKER_EVENTS.length).toBe(4);
    for (const e of TICKER_EVENTS) {
      expect(e.title.startsWith(PEOPLE[e.who].name)).toBe(true);
      if (e.amount !== undefined) expect(Number.isInteger(e.amount) && e.amount > 0).toBe(true);
      expect(`${e.title}${e.note}`).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });

  it('đổi sự kiện mỗi 4 giây', () => {
    expect(TICKER_INTERVAL_MS).toBe(4000);
  });
});

describe('advanceTicker', () => {
  it('đi hết một vòng rồi dừng lại ở sự kiện đầu', () => {
    let state = { index: 0, steps: 0 };
    const seen: number[] = [];
    for (;;) {
      const next = advanceTicker(state, 4);
      if (!next) break;
      seen.push(next.index);
      state = next;
    }
    expect(seen).toEqual([1, 2, 3, 0]);
  });
});

describe('shouldRunTicker', () => {
  const ok = { reduceMotion: false, inView: true, pageVisible: true, paused: false };

  it('chỉ chạy khi thấy được và không ai đang trỏ chuột / focus vào', () => {
    expect(shouldRunTicker(ok)).toBe(true);
    expect(shouldRunTicker({ ...ok, inView: false })).toBe(false);
    expect(shouldRunTicker({ ...ok, pageVisible: false })).toBe(false);
    expect(shouldRunTicker({ ...ok, paused: true })).toBe(false);
  });

  it('giảm chuyển động thì đứng yên ở sự kiện đầu', () => {
    expect(shouldRunTicker({ ...ok, reduceMotion: true })).toBe(false);
  });
});
