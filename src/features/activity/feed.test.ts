import { describe, expect, it } from 'vitest';
import { latestCreatedAt, mergeActivities, TICKER_QUEUE_MAX, tickerReceive, tickerRelease } from './feed.ts';
import type { Activity } from './types.ts';

const act = (id: string, minute: number): Activity => ({
  id,
  type: 'chore.submitted',
  actorUserId: 'u1',
  actorName: 'Mai',
  params: {},
  createdAt: `2026-10-21T13:${String(minute).padStart(2, '0')}:00.000Z`,
});

describe('mergeActivities', () => {
  it('bỏ trùng theo id, mới nhất trước, cắt theo limit', () => {
    const merged = mergeActivities([act('a', 1), act('b', 2)], [act('b', 2), act('c', 3)], 2);
    expect(merged.map((a) => a.id)).toEqual(['c', 'b']);
  });

  it('latestCreatedAt', () => {
    expect(latestCreatedAt([])).toBeNull();
    expect(latestCreatedAt([act('a', 5), act('b', 9), act('c', 2)])).toBe('2026-10-21T13:09:00.000Z');
  });
});

describe('ticker pacing', () => {
  it('lần đầu hiện ngay; mục mới vào hàng đợi rồi nhả từng mục, cũ trước', () => {
    let s = tickerReceive({ shown: [], queue: [] }, [act('b', 2), act('a', 1)]);
    expect(s.shown.map((a) => a.id)).toEqual(['b', 'a']);
    s = tickerReceive(s, [act('d', 4), act('c', 3), act('b', 2), act('a', 1)]);
    expect(s.shown.map((a) => a.id)).toEqual(['b', 'a']);
    expect(s.queue.map((a) => a.id)).toEqual(['c', 'd']);
    s = tickerRelease(s);
    expect(s.shown.map((a) => a.id)).toEqual(['c', 'b', 'a']);
    s = tickerRelease(tickerReceive(s, [act('d', 4)]));
    expect(s.shown.map((a) => a.id)).toEqual(['d', 'c', 'b', 'a']);
    expect(tickerRelease(s)).toBe(s);
  });

  it('hàng đợi tối đa 10, bỏ mục cũ nhất khi tràn', () => {
    const base = tickerReceive({ shown: [], queue: [] }, [act('x', 0)]);
    const burst = Array.from({ length: 15 }, (_, i) => act(`n${i}`, i + 1)).reverse();
    const s = tickerReceive(base, burst);
    expect(s.queue).toHaveLength(TICKER_QUEUE_MAX);
    expect(s.queue[0].id).toBe('n5');
    expect(s.queue.at(-1)!.id).toBe('n14');
  });
});
