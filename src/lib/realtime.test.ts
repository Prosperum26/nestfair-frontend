import { describe, expect, it, vi } from 'vitest';
import { bindHouseEvents, type SocketLike } from './realtime.ts';

type Handler = (...a: unknown[]) => void;

function fakeSocket(connected: boolean) {
  const handlers = new Map<string, Set<Handler>>();
  const ioHandlers = new Map<string, Set<Handler>>();
  const add = (m: Map<string, Set<Handler>>) => (e: string, f: Handler) => {
    if (!m.has(e)) m.set(e, new Set());
    m.get(e)!.add(f);
  };
  const del = (m: Map<string, Set<Handler>>) => (e: string, f: Handler) => {
    m.get(e)?.delete(f);
  };
  const socket: SocketLike & { fire: (e: string) => void; fireIo: (e: string) => void } = {
    connected,
    connect: vi.fn(),
    emit: vi.fn(),
    on: add(handlers),
    off: del(handlers),
    io: { on: add(ioHandlers), off: del(ioHandlers) },
    fire: (e) => handlers.get(e)?.forEach((f) => f()),
    fireIo: (e) => ioHandlers.get(e)?.forEach((f) => f()),
  };
  return socket;
}

describe('bindHouseEvents', () => {
  it('đã kết nối: vào room ngay; event và reconnect gọi onChange; gỡ xong thì im lặng', () => {
    const socket = fakeSocket(true);
    const onChange = vi.fn();
    const off = bindHouseEvents(socket, 'h1', ['expense:new', 'debt:settled'], onChange);
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h1' });

    socket.fire('expense:new');
    socket.fire('debt:settled');
    socket.fireIo('reconnect');
    socket.fire('chore:submitted');
    expect(onChange).toHaveBeenCalledTimes(3);

    off();
    socket.fire('expense:new');
    socket.fireIo('reconnect');
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it('chưa kết nối: gọi connect, vào room khi connect', () => {
    const socket = fakeSocket(false);
    bindHouseEvents(socket, 'h2', ['expense:new'], vi.fn());
    expect(socket.connect).toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
    socket.fire('connect');
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h2' });
  });
});
