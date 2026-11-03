import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { houseKeys } from '@/features/houses/hooks.ts';
import { getSocket } from '@/lib/socket.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { BANNER_AFTER_MS, connectionStatus, OFFLINE_AFTER_MS, showReconnectBanner } from './connection.ts';
import { RealtimeContext, type RealtimeContextValue } from './context.ts';
import { createRealtimeHub, type RealtimeHandler, type SocketLike } from './hub.ts';

/**
 * Query mà nơi nghe sự kiện tự tải lại khi `$resync` (có xử lý riêng, vd. không đổi dữ liệu khi đang mở modal,
 * hoặc bù ticker bằng `since`). Mọi query khác được tải lại chung sau khi nối lại.
 */
const SELF_RESYNCED = new Set(['assignments', 'activity']);

/**
 * Một kết nối Socket.IO cho nhà đang xem, đặt trong AppShell. Cung cấp trạng thái kết nối, ai đang online,
 * lệch giờ server và `subscribe` cho các module. Nối lại thì tải lại dữ liệu qua REST.
 */
export function RealtimeProvider({ houseId, children }: { houseId: string | undefined; children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const me = useAuthStore((s) => s.user?.id);
  const [disconnectedAt, setDisconnectedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [onlineUserIds, setOnline] = useState<string[]>([]);
  const [clockOffsetMs, setClockOffset] = useState(0);
  const handlers = useRef(new Map<string, Set<RealtimeHandler>>());

  const subscribe = useCallback((event: string, handler: RealtimeHandler) => {
    const set = handlers.current.get(event) ?? new Set<RealtimeHandler>();
    set.add(handler);
    handlers.current.set(event, set);
    return () => {
      set.delete(handler);
    };
  }, []);

  useEffect(() => {
    if (!houseId) return;
    const hub = createRealtimeHub(getSocket() as unknown as SocketLike, houseId, {
      onConnection: (connected) => setDisconnectedAt((prev) => (connected ? null : (prev ?? Date.now()))),
      onPresence: setOnline,
      onClockOffset: setClockOffset,
      onResync: () =>
        void queryClient.invalidateQueries({ predicate: (q) => !SELF_RESYNCED.has(String(q.queryKey[0])) }),
    });
    const off = hub.subscribe('*', (env) => handlers.current.get(env.type)?.forEach((h) => h(env)));
    return () => {
      off();
      hub.destroy();
    };
  }, [houseId, queryClient]);

  // Người dùng bị xóa khỏi nhà / rời nhà ở thiết bị khác.
  useEffect(
    () =>
      subscribe('member:left', (env) => {
        const p = env.payload as { userId: string };
        if (p.userId !== me) {
          void queryClient.invalidateQueries({ queryKey: houseKeys.all });
          return;
        }
        toast('Bạn không còn là thành viên của nhà này.');
        void queryClient.invalidateQueries({ queryKey: houseKeys.all });
        void navigate('/onboarding', { replace: true });
      }),
    [subscribe, me, queryClient, navigate],
  );
  useEffect(
    () => subscribe('member:joined', () => void queryClient.invalidateQueries({ queryKey: houseKeys.all })),
    [subscribe, queryClient],
  );

  // Đang mất kết nối: hẹn giờ đúng mốc 5s (banner) và 30s (mất kết nối) để vẽ lại.
  useEffect(() => {
    if (disconnectedAt === null) return;
    const timers = [BANNER_AFTER_MS, OFFLINE_AFTER_MS].map((ms) =>
      setTimeout(() => setNow(Date.now()), Math.max(0, disconnectedAt + ms - Date.now()) + 50),
    );
    return () => timers.forEach(clearTimeout);
  }, [disconnectedAt]);

  const value = useMemo<RealtimeContextValue>(() => {
    const t = Math.max(now, disconnectedAt ?? 0);
    return {
      status: connectionStatus(disconnectedAt, t),
      showBanner: showReconnectBanner(disconnectedAt, t),
      onlineUserIds,
      clockOffsetMs,
      subscribe,
    };
  }, [disconnectedAt, now, onlineUserIds, clockOffsetMs, subscribe]);

  return <RealtimeContext value={value}>{children}</RealtimeContext>;
}
