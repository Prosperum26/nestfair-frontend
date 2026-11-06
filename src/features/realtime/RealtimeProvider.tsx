import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { houseKeys } from '@/features/houses/hooks.ts';
import type { HouseSummary } from '@/features/houses/types.ts';
import { useDropHouse, useInvalidateAfterMemberChange } from '@/features/membership/hooks.ts';
import { getSocket } from '@/lib/socket.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { useHouseStore } from '@/stores/house-store.ts';
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
  const selectHouse = useHouseStore((s) => s.selectHouse);
  const invalidateAfterMemberChange = useInvalidateAfterMemberChange();
  const dropHouse = useDropHouse();
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

  // Một người rời / bị xóa: số dư, lịch trực, đổi ca của cả nhà đổi theo. Chính mình: rời khỏi nhà này
  // (tự rời ở thiết bị khác thì im lặng, bị trưởng phòng xóa thì báo). Còn nhà khác thì vào nhà đó, hết nhà thì /onboarding.
  useEffect(
    () =>
      subscribe('member:left', (env) => {
        const p = env.payload as { userId: string; kicked?: boolean };
        if (p.userId !== me) {
          if (env.houseId) void invalidateAfterMemberChange(env.houseId);
          return;
        }
        if (p.kicked) toast('Trưởng phòng đã xóa bạn khỏi nhà này.');
        selectHouse(null);
        // Bỏ nhà vừa rời khỏi cache trước (danh sách + chi tiết): nếu không, trang chọn lại nhà đó và tải chi tiết bị 403.
        if (env.houseId) {
          const left = env.houseId;
          queryClient.setQueryData<HouseSummary[]>(houseKeys.all, (list) => list?.filter((h) => h.id !== left));
          queryClient.removeQueries({ queryKey: houseKeys.detail(left) });
        }
        void queryClient.invalidateQueries({ queryKey: houseKeys.all, exact: true });
        void navigate('/dashboard', { replace: true });
      }),
    [subscribe, me, queryClient, navigate, invalidateAfterMemberChange, selectHouse],
  );
  // Nhà bị giải tán (tới từng người qua room cá nhân): bỏ nhà khỏi cache rồi về Tổng quan. Cùng `id` toast với hộp thoại
  // của trưởng phòng nên người bấm giải tán chỉ thấy một thông báo.
  useEffect(
    () =>
      subscribe('house:dissolved', (env) => {
        const p = env.payload as { houseId: string; name: string };
        toast(`${p.name} đã được giải tán.`, { id: `dissolved-${p.houseId}` });
        void dropHouse(p.houseId);
        void navigate('/dashboard', { replace: true });
      }),
    [subscribe, dropHouse, navigate],
  );
  // Đổi trưởng phòng: vai trò của mình (myRole) có thể đã đổi.
  useEffect(
    () => subscribe('member:role_changed', () => void queryClient.invalidateQueries({ queryKey: houseKeys.all })),
    [subscribe, queryClient],
  );
  // Đề xuất nội quy mới / đã xử lý: tải lại chi tiết nhà (gồm cả danh sách đề xuất, nội quy).
  useEffect(() => {
    const refresh = () => houseId && void queryClient.invalidateQueries({ queryKey: houseKeys.detail(houseId) });
    const offs = [subscribe('rule_proposal:created', refresh), subscribe('rule_proposal:decided', refresh)];
    return () => offs.forEach((off) => off());
  }, [subscribe, queryClient, houseId]);
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
