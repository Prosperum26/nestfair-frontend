import { describe, expect, it, vi } from 'vitest';
import type { SocketLike } from '@/lib/realtime.ts';
import { listingKeys } from './keys.ts';
import { bindListingRealtime, LISTING_EVENTS } from './realtime.ts';

type Handler = (...a: unknown[]) => void;

/** Socket giả theo mẫu `src/lib/realtime.test.ts`. */
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
  const socket: SocketLike & { fire: (e: string) => void; fireIo: (e: string) => void; listenerCount: (e: string) => number } = {
    connected,
    connect: vi.fn(),
    emit: vi.fn(),
    on: add(handlers),
    off: del(handlers),
    io: { on: add(ioHandlers), off: del(ioHandlers) },
    fire: (e) => handlers.get(e)?.forEach((f) => f()),
    fireIo: (e) => ioHandlers.get(e)?.forEach((f) => f()),
    listenerCount: (e) => handlers.get(e)?.size ?? 0,
  };
  return socket;
}

const fakeClient = () => ({ invalidateQueries: vi.fn(() => Promise.resolve()) });

describe('LISTING_EVENTS', () => {
  it('chỉ có đúng một event: listing:closed', () => {
    expect([...LISTING_EVENTS]).toEqual(['listing:closed']);
  });
});

describe('bindListingRealtime', () => {
  it('vào room của nhà và lắng nghe listing:closed', () => {
    const socket = fakeSocket(true);
    bindListingRealtime(socket, 'h1', fakeClient());
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h1' });
    expect(socket.listenerCount('listing:closed')).toBe(1);
  });

  it('nhận listing:closed thì làm tươi listingKeys.detail(houseId) đúng một lần', () => {
    const socket = fakeSocket(true);
    const client = fakeClient();
    bindListingRealtime(socket, 'h1', client);
    socket.fire('listing:closed');
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
    expect(client.invalidateQueries).toHaveBeenCalledWith({ queryKey: listingKeys.detail('h1') });
  });

  it('nối lại sau khi mất mạng cũng làm tươi; event khác thì không', () => {
    const socket = fakeSocket(true);
    const client = fakeClient();
    bindListingRealtime(socket, 'h1', client);
    socket.fireIo('reconnect');
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
    socket.fire('expense:new');
    socket.fire('chore:submitted');
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  it('chưa kết nối thì gọi connect và chỉ vào room khi connect', () => {
    const socket = fakeSocket(false);
    bindListingRealtime(socket, 'h2', fakeClient());
    expect(socket.connect).toHaveBeenCalled();
    expect(socket.emit).not.toHaveBeenCalled();
    socket.fire('connect');
    expect(socket.emit).toHaveBeenCalledWith('house:join_room', { houseId: 'h2' });
  });

  it('houseId rỗng thì không đụng tới socket', () => {
    const socket = fakeSocket(true);
    const client = fakeClient();
    const off = bindListingRealtime(socket, undefined, client);
    expect(socket.emit).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();
    expect(socket.listenerCount('listing:closed')).toBe(0);
    socket.fire('listing:closed');
    expect(client.invalidateQueries).not.toHaveBeenCalled();
    expect(() => off()).not.toThrow();
  });

  it('trả về hàm gỡ: gỡ xong thì im lặng', () => {
    const socket = fakeSocket(true);
    const client = fakeClient();
    const off = bindListingRealtime(socket, 'h1', client);
    off();
    expect(socket.listenerCount('listing:closed')).toBe(0);
    socket.fire('listing:closed');
    socket.fireIo('reconnect');
    expect(client.invalidateQueries).not.toHaveBeenCalled();
  });
});
