import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESYNC, type RealtimeHandler } from '@/features/realtime/hub.ts';
import { swapKeys } from './keys.ts';
import { bindSwapRealtime, DEBT_EVENTS, invalidateSwapData, SWAP_CHANGE_EVENTS, SWAP_EVENTS } from './realtime.ts';

/** Bus giả: `emit` gọi mọi handler đã đăng ký cho sự kiện đó. */
function fakeBus() {
  const handlers = new Map<string, Set<RealtimeHandler>>();
  const subscribe = (event: string, handler: RealtimeHandler) => {
    const set = handlers.get(event) ?? new Set();
    set.add(handler);
    handlers.set(event, set);
    return () => set.delete(handler);
  };
  const emit = (event: string) => handlers.get(event)?.forEach((h) => h({ eventId: event, type: event, houseId: 'h1', occurredAt: '', actor: null, payload: {} }));
  const count = () => [...handlers.values()].reduce((n, s) => n + s.size, 0);
  return { subscribe, emit, count };
}

describe('sự kiện đổi ca', () => {
  it('nghe đủ 6 sự kiện swap, 4 sự kiện chore_debt và nối lại sau mất mạng', () => {
    expect(SWAP_EVENTS).toEqual(['swap:requested', 'swap:accepted', 'swap:rejected', 'swap:expired', 'swap:cancelled', 'swap:escalated']);
    expect(DEBT_EVENTS).toEqual(['chore_debt:created', 'chore_debt:pick_requested', 'chore_debt:paid', 'chore_debt:forgiven']);
    expect(SWAP_CHANGE_EVENTS).toEqual([...SWAP_EVENTS, ...DEBT_EVENTS, RESYNC]);
  });
});

describe('bindSwapRealtime', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('swap:accepted gọi onChange một lần sau 300 ms', () => {
    const bus = fakeBus();
    const onChange = vi.fn();
    bindSwapRealtime(bus.subscribe, onChange);
    bus.emit('swap:accepted');
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(299);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('nhiều sự kiện trong 300 ms chỉ gọi một lần', () => {
    const bus = fakeBus();
    const onChange = vi.fn();
    bindSwapRealtime(bus.subscribe, onChange);
    bus.emit('swap:requested');
    vi.advanceTimersByTime(100);
    bus.emit('swap:accepted');
    vi.advanceTimersByTime(100);
    bus.emit('chore_debt:created');
    vi.advanceTimersByTime(299);
    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('hai đợt cách nhau quá 300 ms gọi hai lần', () => {
    const bus = fakeBus();
    const onChange = vi.fn();
    bindSwapRealtime(bus.subscribe, onChange);
    bus.emit('swap:expired');
    vi.advanceTimersByTime(300);
    bus.emit('chore_debt:paid');
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('nối lại sau mất mạng (RESYNC) cũng tải lại', () => {
    const bus = fakeBus();
    const onChange = vi.fn();
    bindSwapRealtime(bus.subscribe, onChange);
    bus.emit(RESYNC);
    vi.advanceTimersByTime(300);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('hàm gỡ bỏ đăng ký và hủy lần gọi đang chờ', () => {
    const bus = fakeBus();
    const onChange = vi.fn();
    const off = bindSwapRealtime(bus.subscribe, onChange);
    expect(bus.count()).toBe(SWAP_CHANGE_EVENTS.length);
    bus.emit('swap:cancelled');
    off();
    vi.advanceTimersByTime(1000);
    expect(onChange).not.toHaveBeenCalled();
    expect(bus.count()).toBe(0);
  });
});

describe('invalidateSwapData', () => {
  it('tải lại danh sách yêu cầu, sổ nợ và lịch trực của nhà', () => {
    const invalidateQueries = vi.fn();
    invalidateSwapData({ invalidateQueries }, 'h1');
    const keys = invalidateQueries.mock.calls.map((c) => (c[0] as { queryKey: unknown[] }).queryKey);
    expect(keys).toEqual([swapKeys.all('h1'), swapKeys.debts('h1'), ['assignments', 'h1']]);
  });
});
