/** Envelope chung của mọi sự kiện server phát (đặc tả #5 mục 7). */
export interface RealtimeEnvelope<P = unknown> {
  eventId: string;
  type: string;
  houseId: string | null;
  occurredAt: string;
  actor: { userId: string; name: string } | null;
  payload: P;
}

export type RealtimeHandler = (envelope: RealtimeEnvelope) => void;

/** Sự kiện giả do client tự bắn sau khi nối lại: nơi nghe thì tải lại dữ liệu của mình. */
export const RESYNC = '$resync';
/** Debounce trước khi tải lại sau reconnect: nhiều sự kiện ập đến cùng lúc chỉ tải một lần (RT-09). */
export const RESYNC_DEBOUNCE_MS = 300;
/** Số eventId gần nhất giữ lại để bỏ trùng. */
export const SEEN_LIMIT = 200;

/** Phần của socket.io-client mà hub dùng (để test bằng socket giả). */
export interface SocketLike {
  connected: boolean;
  connect: () => unknown;
  emit: (event: string, ...args: unknown[]) => unknown;
  on: (event: string, listener: (...args: unknown[]) => void) => unknown;
  off: (event: string, listener: (...args: unknown[]) => void) => unknown;
  onAny: (listener: (event: string, ...args: unknown[]) => void) => unknown;
  offAny: (listener: (event: string, ...args: unknown[]) => void) => unknown;
}

export type JoinAck = { ok: true; onlineUserIds: string[]; serverNow: string } | { ok: false; code: string };

/** Vòng đệm id đã thấy: `true` nếu là lần đầu. */
export function createSeenIds(limit = SEEN_LIMIT): (id: string) => boolean {
  const seen = new Set<string>();
  const order: string[] = [];
  return (id) => {
    if (seen.has(id)) return false;
    seen.add(id);
    order.push(id);
    if (order.length > limit) seen.delete(order.shift()!);
    return true;
  };
}

function isEnvelope(x: unknown): x is RealtimeEnvelope {
  return !!x && typeof x === 'object' && typeof (x as RealtimeEnvelope).eventId === 'string' && 'payload' in x;
}

export interface HubCallbacks {
  /** Kết nối đổi trạng thái (true = đang kết nối). */
  onConnection?: (connected: boolean) => void;
  /** Danh sách thành viên đang online của nhà (ack join + presence:update). */
  onPresence?: (onlineUserIds: string[]) => void;
  /** Đã nối lại sau khi mất kết nối (đã debounce). */
  onResync?: () => void;
  /** Lệch giờ server − giờ máy (ms), đo khi join. */
  onClockOffset?: (offsetMs: number) => void;
}

export interface RealtimeHub {
  subscribe: (event: string, handler: RealtimeHandler) => () => void;
  destroy: () => void;
}

/**
 * Gắn một socket vào nhà đang xem:
 * - vào room `house:<id>` mỗi lần (nối) kết nối, đọc presence từ ack;
 * - phân phối sự kiện theo tên, bỏ trùng theo `eventId`;
 * - nối lại sau khi mất kết nối thì (debounce 300 ms) báo `$resync` để nơi nghe tải lại qua REST.
 * Socket chỉ để báo "có thay đổi": không ai ghi dữ liệu qua socket.
 */
export function createRealtimeHub(socket: SocketLike, houseId: string, cb: HubCallbacks = {}): RealtimeHub {
  const handlers = new Map<string, Set<RealtimeHandler>>();
  const firstSeen = createSeenIds();
  let everConnected = socket.connected;
  let resyncTimer: ReturnType<typeof setTimeout> | null = null;

  /** Handler đăng ký `'*'` nhận mọi sự kiện (kể cả `$resync`). */
  const dispatch = (event: string, envelope: RealtimeEnvelope) => {
    handlers.get(event)?.forEach((h) => h(envelope));
    handlers.get('*')?.forEach((h) => h(envelope));
  };

  const join = () => {
    socket.emit('house:join_room', { houseId }, (ack: JoinAck) => {
      if (ack?.ok) {
        cb.onPresence?.(ack.onlineUserIds);
        cb.onClockOffset?.(Date.parse(ack.serverNow) - Date.now());
      }
    });
  };

  const onConnect = () => {
    cb.onConnection?.(true);
    join();
    if (everConnected) {
      if (resyncTimer) clearTimeout(resyncTimer);
      resyncTimer = setTimeout(() => {
        resyncTimer = null;
        cb.onResync?.();
        dispatch(RESYNC, { eventId: '', type: RESYNC, houseId, occurredAt: new Date().toISOString(), actor: null, payload: null });
      }, RESYNC_DEBOUNCE_MS);
    }
    everConnected = true;
  };
  const onDisconnect = () => cb.onConnection?.(false);
  const onAny = (event: string, ...args: unknown[]) => {
    const envelope = args[0];
    if (!isEnvelope(envelope) || !firstSeen(envelope.eventId)) return;
    if (envelope.houseId && envelope.houseId !== houseId && event !== 'member:left') return;
    if (event === 'presence:update') cb.onPresence?.((envelope.payload as { onlineUserIds: string[] }).onlineUserIds);
    dispatch(event, envelope);
  };

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.onAny(onAny);
  if (socket.connected) {
    cb.onConnection?.(true);
    join();
  } else {
    cb.onConnection?.(false);
    socket.connect();
  }

  return {
    subscribe(event, handler) {
      const set = handlers.get(event) ?? new Set<RealtimeHandler>();
      set.add(handler);
      handlers.set(event, set);
      return () => set.delete(handler);
    },
    destroy() {
      if (resyncTimer) clearTimeout(resyncTimer);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.offAny(onAny);
      handlers.clear();
    },
  };
}
