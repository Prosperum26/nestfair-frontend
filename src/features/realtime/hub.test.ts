import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRealtimeHub, createSeenIds, RESYNC, RESYNC_DEBOUNCE_MS, type SocketLike } from './hub.ts';

type Listener = (...args: unknown[]) => void;

/** Socket giả: lưu listener để test tự bắn sự kiện, ack của join do test quyết định. */
function fakeSocket(connected: boolean, ack: unknown = { ok: true, onlineUserIds: ['u1'], serverNow: new Date(Date.now() + 1000).toISOString() }) {
  const handlers = new Map<string, Set<Listener>>();
  const anys = new Set<(event: string, ...args: unknown[]) => void>();
  const socket = {
    connected,
    connect: vi.fn(),
    emit: vi.fn((_event: string, _body: unknown, cb?: (a: unknown) => void) => cb?.(ack)),
    on: (ev: string, fn: Listener) => {
      if (!handlers.has(ev)) handlers.set(ev, new Set());
      handlers.get(ev)!.add(fn);
    },
    off: (ev: string, fn: Listener) => handlers.get(ev)?.delete(fn),
    onAny: (fn: (event: string, ...args: unknown[]) => void) => anys.add(fn),
    offAny: (fn: (event: string, ...args: unknown[]) => void) => anys.delete(fn),
  };
  const fire = (ev: string) => handlers.get(ev)?.forEach((fn) => fn());
  const server = (ev: string, envelope: unknown) => anys.forEach((fn) => fn(ev, envelope));
  const listeners = () => [...handlers.values()].reduce((n, s) => n + s.size, 0) + anys.size;
  return { socket: socket as SocketLike & typeof socket, fire, server, listeners };
}

const env = (type: string, eventId: string, extra: object = {}) => ({
  eventId,
  type,
  houseId: 'h1',
  occurredAt: '2026-10-21T13:15:00.000Z',
  actor: null,
  payload: {},
  ...extra,
});

describe('createSeenIds', () => {
  it('lần đầu true, trùng thì false, quên id cũ khi vượt giới hạn', () => {
    const seen = createSeenIds(2);
    expect(seen('a')).toBe(true);
    expect(seen('a')).toBe(false);
    seen('b');
    seen('c');
    expect(seen('a')).toBe(true);
  });
});

describe('createRealtimeHub', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('đang kết nối: vào room nhà ngay, đọc presence và lệch giờ từ ack', () => {
    const { socket } = fakeSocket(true);
    const onPresence = vi.fn();
    const onClockOffset = vi.fn();
    createRealtimeHub(socket, 'h1', { onPresence, onClockOffset });
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h1' }, expect.any(Function));
    expect(socket.connect).not.toHaveBeenCalled();
    expect(onPresence).toHaveBeenCalledWith(['u1']);
    expect(onClockOffset.mock.calls[0][0]).toBeGreaterThan(900);
  });

  it('chưa kết nối: báo mất kết nối, gọi connect và vào room khi connect tới', () => {
    const { socket, fire } = fakeSocket(false);
    const onConnection = vi.fn();
    createRealtimeHub(socket, 'h1', { onConnection });
    expect(onConnection).toHaveBeenLastCalledWith(false);
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socket.emit).not.toHaveBeenCalled();
    fire('connect');
    expect(onConnection).toHaveBeenLastCalledWith(true);
    expect(socket.emit).toHaveBeenCalledTimes(1);
  });

  it('join bị từ chối (NOT_A_MEMBER) thì không cập nhật presence', () => {
    const { socket } = fakeSocket(true, { ok: false, code: 'NOT_A_MEMBER' });
    const onPresence = vi.fn();
    createRealtimeHub(socket, 'h1', { onPresence });
    expect(onPresence).not.toHaveBeenCalled();
  });

  it('phân phối theo tên sự kiện và cho handler "*", bỏ trùng eventId (RT-03)', () => {
    const { socket, server } = fakeSocket(true);
    const hub = createRealtimeHub(socket, 'h1');
    const onSubmitted = vi.fn();
    const onAll = vi.fn();
    hub.subscribe('chore:submitted', onSubmitted);
    hub.subscribe('*', onAll);
    server('chore:submitted', env('chore:submitted', 'e1'));
    server('chore:submitted', env('chore:submitted', 'e1'));
    server('chore:verified', env('chore:verified', 'e2'));
    expect(onSubmitted).toHaveBeenCalledTimes(1);
    expect(onAll).toHaveBeenCalledTimes(2);
  });

  it('bỏ sự kiện của nhà khác và payload không phải envelope', () => {
    const { socket, server } = fakeSocket(true);
    const hub = createRealtimeHub(socket, 'h1');
    const fn = vi.fn();
    hub.subscribe('chore:submitted', fn);
    server('chore:submitted', env('chore:submitted', 'x', { houseId: 'h2' }));
    server('chore:submitted', { assignmentId: 'raw' });
    expect(fn).not.toHaveBeenCalled();
  });

  it('presence:update cập nhật danh sách online', () => {
    const { socket, server } = fakeSocket(true);
    const onPresence = vi.fn();
    createRealtimeHub(socket, 'h1', { onPresence });
    server('presence:update', env('presence:update', 'p1', { payload: { onlineUserIds: ['u1', 'u2'] } }));
    expect(onPresence).toHaveBeenLastCalledWith(['u1', 'u2']);
  });

  it('nối lại: debounce 300 ms rồi báo $resync một lần dù connect bắn nhiều lần (RT-01, RT-09)', () => {
    const { socket, fire } = fakeSocket(true);
    const onResync = vi.fn();
    const hub = createRealtimeHub(socket, 'h1', { onResync });
    const onEvent = vi.fn();
    hub.subscribe(RESYNC, onEvent);
    fire('disconnect');
    fire('connect');
    fire('connect');
    expect(onResync).not.toHaveBeenCalled();
    vi.advanceTimersByTime(RESYNC_DEBOUNCE_MS);
    expect(onResync).toHaveBeenCalledTimes(1);
    expect(onEvent).toHaveBeenCalledTimes(1);
  });

  it('lần nối đầu tiên không bị coi là nối lại', () => {
    const { socket, fire } = fakeSocket(false);
    const onResync = vi.fn();
    createRealtimeHub(socket, 'h1', { onResync });
    fire('connect');
    vi.advanceTimersByTime(1000);
    expect(onResync).not.toHaveBeenCalled();
  });

  it('destroy gỡ hết listener', () => {
    const { socket, listeners } = fakeSocket(true);
    const hub = createRealtimeHub(socket, 'h1');
    expect(listeners()).toBeGreaterThan(0);
    hub.destroy();
    expect(listeners()).toBe(0);
  });
});
