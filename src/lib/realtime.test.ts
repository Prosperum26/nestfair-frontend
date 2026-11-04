import { describe, expect, it, vi } from 'vitest';
import { bindHouseEvents, bindUserEvents, type SocketLike } from './realtime.ts';

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
  const socket: SocketLike & { fire: (e: string, ...a: unknown[]) => void; fireIo: (e: string) => void } = {
    connected,
    connect: vi.fn(),
    emit: vi.fn(),
    on: add(handlers),
    off: del(handlers),
    io: { on: add(ioHandlers), off: del(ioHandlers) },
    fire: (e, ...args) => handlers.get(e)?.forEach((f) => f(...args)),
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

describe('bindUserEvents', () => {
  it('đăng ký đúng các event, nhận nguyên payload; không vào room nhà; gỡ xong thì im lặng, gỡ lần hai an toàn', () => {
    const socket = fakeSocket(true);
    const onEvent = vi.fn();
    const off = bindUserEvents(socket, ['reminder:due'], onEvent);

    // Đã kết nối: không emit house:join_room (server tự đưa socket vào room user khi bắt tay).
    expect(socket.emit).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();

    socket.fire('reminder:due', { reminderId: 'r1', title: 'Đổ rác tối nay' });
    socket.fire('reminder:due', null); // payload sai kiểu vẫn pass nguyên; lọc kiểu làm ở hook
    socket.fire('reminder:due', 42);
    socket.fire('expense:new', { total: 170000 }); // event ngoài danh sách: không gọi
    expect(onEvent.mock.calls).toEqual([
      ['reminder:due', { reminderId: 'r1', title: 'Đổ rác tối nay' }],
      ['reminder:due', null],
      ['reminder:due', 42],
    ]);

    off();
    socket.fire('reminder:due', { reminderId: 'r2', title: 'Khác' });
    off(); // gọi lần hai phải an toàn
    socket.fire('reminder:due', { reminderId: 'r3', title: 'Khác nữa' });
    expect(onEvent).toHaveBeenCalledTimes(3);
  });

  it('chưa kết nối: gọi connect, không emit gì', () => {
    const socket = fakeSocket(false);
    bindUserEvents(socket, ['reminder:due'], vi.fn());
    expect(socket.connect).toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
  });

  it('socket nối lại (connect / manager reconnect) → onEvent("reconnect", null)', () => {
    const socket = fakeSocket(true);
    const onEvent = vi.fn();
    const off = bindUserEvents(socket, ['reminder:due'], onEvent);

    socket.fire('connect');
    expect(onEvent).toHaveBeenCalledWith('reconnect', null);
    onEvent.mockClear();
    socket.fireIo('reconnect');
    expect(onEvent).toHaveBeenCalledWith('reconnect', null);

    onEvent.mockClear();
    off();
    socket.fire('connect');
    socket.fireIo('reconnect');
    expect(onEvent).not.toHaveBeenCalled();
  });
});
