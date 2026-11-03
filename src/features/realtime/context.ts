import { createContext, useContext, useEffect, useRef } from 'react';
import type { ConnectionStatus } from './connection.ts';
import type { RealtimeEnvelope, RealtimeHandler } from './hub.ts';

export interface RealtimeContextValue {
  status: ConnectionStatus;
  /** Mất kết nối > 5 giây: hiện banner "Đang kết nối lại…". */
  showBanner: boolean;
  onlineUserIds: string[];
  /** Giờ server − giờ máy (ms). Dùng để đồng bộ animation theo giờ server. */
  clockOffsetMs: number;
  subscribe: (event: string, handler: RealtimeHandler) => () => void;
}

const noop = () => () => undefined;

export const RealtimeContext = createContext<RealtimeContextValue>({
  status: 'connected',
  showBanner: false,
  onlineUserIds: [],
  clockOffsetMs: 0,
  subscribe: noop,
});

/** Kết nối realtime của nhà đang xem (trạng thái, ai online, đăng ký sự kiện). */
export function useSocket(): RealtimeContextValue {
  return useContext(RealtimeContext);
}

/**
 * Nghe một (hoặc nhiều) sự kiện trong vòng đời component. Handler mới nhất luôn được gọi
 * (không cần useCallback ở nơi dùng).
 */
export function useRealtimeEvent(events: string | readonly string[], handler: (envelope: RealtimeEnvelope) => void) {
  const { subscribe } = useSocket();
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  const key = typeof events === 'string' ? events : events.join('|');
  useEffect(() => {
    const offs = key.split('|').map((e) => subscribe(e, (env) => ref.current(env)));
    return () => offs.forEach((off) => off());
  }, [key, subscribe]);
}
