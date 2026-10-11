import { describe, expect, it, vi } from 'vitest';
import { bindChoreRealtime, CHORE_EVENTS, createChangeHandler, type SocketLike } from './realtime.ts';

/** Socket giả: lưu listener để test tự bắn sự kiện. */
function fakeSocket(connected: boolean) {
  const handlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const managerHandlers = new Map<string, Set<(...args: unknown[]) => void>>();
  const add = (map: typeof handlers, ev: string, fn: (...args: unknown[]) => void) => {
    if (!map.has(ev)) map.set(ev, new Set());
    map.get(ev)!.add(fn);
  };
  const del = (map: typeof handlers, ev: string, fn: (...args: unknown[]) => void) => map.get(ev)?.delete(fn);
  const socket = {
    connected,
    connect: vi.fn(),
    emit: vi.fn(),
    on: (ev: string, fn: (...args: unknown[]) => void) => add(handlers, ev, fn),
    off: (ev: string, fn: (...args: unknown[]) => void) => del(handlers, ev, fn),
    io: {
      on: (ev: string, fn: (...args: unknown[]) => void) => add(managerHandlers, ev, fn),
      off: (ev: string, fn: (...args: unknown[]) => void) => del(managerHandlers, ev, fn),
    },
  };
  const fire = (ev: string) => handlers.get(ev)?.forEach((fn) => fn());
  const fireManager = (ev: string) => managerHandlers.get(ev)?.forEach((fn) => fn());
  const listenerCount = () =>
    [...handlers.values(), ...managerHandlers.values()].reduce((n, set) => n + set.size, 0);
  return { socket: socket as unknown as SocketLike & typeof socket, fire, fireManager, listenerCount };
}

describe('bindChoreRealtime', () => {
  it('đang kết nối: vào room nhà ngay, không gọi connect lại', () => {
    const { socket } = fakeSocket(true);
    bindChoreRealtime(socket, 'h1', vi.fn());
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h1' });
    expect(socket.connect).not.toHaveBeenCalled();
  });

  it('chưa kết nối: gọi connect, và vào room khi sự kiện connect tới (kể cả lần nối lại)', () => {
    const { socket, fire } = fakeSocket(false);
    bindChoreRealtime(socket, 'h1', vi.fn());
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.emit).not.toHaveBeenCalled();
    fire('connect');
    fire('connect');
    expect(socket.emit).toHaveBeenCalledTimes(2);
  });

  it('đủ 6 event việc nhà làm tải lại dữ liệu, event khác thì không', () => {
    expect([...CHORE_EVENTS].sort()).toEqual([
      'chore:cancelled',
      'chore:missed',
      'chore:reassigned',
      'chore:shuffled',
      'chore:submitted',
      'chore:verified',
    ]);
    const { socket, fire } = fakeSocket(true);
    const onChange = vi.fn();
    bindChoreRealtime(socket, 'h1', onChange);
    for (const ev of CHORE_EVENTS) fire(ev);
    expect(onChange).toHaveBeenCalledTimes(6);
    fire('expense:new');
    fire('connect');
    expect(onChange).toHaveBeenCalledTimes(6);
  });

  it('nối lại sau khi mất kết nối thì tải lại dữ liệu', () => {
    const { socket, fireManager } = fakeSocket(true);
    const onChange = vi.fn();
    bindChoreRealtime(socket, 'h1', onChange);
    fireManager('reconnect');
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('hủy bind gỡ hết listener', () => {
    const { socket, fire, listenerCount } = fakeSocket(true);
    const onChange = vi.fn();
    const unbind = bindChoreRealtime(socket, 'h1', onChange);
    expect(listenerCount()).toBeGreaterThan(0);
    unbind();
    expect(listenerCount()).toBe(0);
    fire('chore:shuffled');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('createChangeHandler', () => {
  it('không mở modal: tải lại ngay', () => {
    const invalidate = vi.fn();
    const markStale = vi.fn();
    createChangeHandler({ isModalOpen: () => false, invalidate, markStale })();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(markStale).not.toHaveBeenCalled();
  });

  it('đang mở modal: KHÔNG tải lại (tránh đóng/đổi modal đột ngột), chỉ đánh dấu cần tải lại', () => {
    const invalidate = vi.fn();
    const markStale = vi.fn();
    createChangeHandler({ isModalOpen: () => true, invalidate, markStale })();
    expect(invalidate).not.toHaveBeenCalled();
    expect(markStale).toHaveBeenCalledTimes(1);
  });

  it('đọc trạng thái modal tại thời điểm có sự kiện (không chốt lúc tạo)', () => {
    let open = false;
    const invalidate = vi.fn();
    const markStale = vi.fn();
    const handle = createChangeHandler({ isModalOpen: () => open, invalidate, markStale });
    handle();
    open = true;
    handle();
    expect(invalidate).toHaveBeenCalledTimes(1);
    expect(markStale).toHaveBeenCalledTimes(1);
  });
});
