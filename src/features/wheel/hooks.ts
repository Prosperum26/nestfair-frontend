import { useMutation, useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router';
import { toast } from 'sonner';
import { useRealtimeEvent } from '@/features/realtime/context.ts';
import { RESYNC } from '@/features/realtime/hub.ts';
import { firstName } from '@/lib/date.ts';
import { useAuthStore } from '@/stores/auth-store.ts';
import { type SpinInput, wheelApi } from './api.ts';
import { useWheelStore } from './store.ts';
import type { WheelSpin } from './types.ts';

export const wheelKeys = {
  options: (houseId: string) => ['wheel', houseId, 'options'] as const,
  current: (houseId: string) => ['wheel', houseId, 'current'] as const,
};

export function useWheelOptions(houseId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: wheelKeys.options(houseId ?? ''),
    queryFn: () => wheelApi.options(houseId!),
    enabled: !!houseId && enabled,
    staleTime: 0,
  });
}

export function useSpin(houseId: string) {
  return useMutation({ mutationFn: ({ body, key }: { body: SpinInput; key: string }) => wheelApi.spin(houseId, body, key) });
}

export function useVoidSpin() {
  return useMutation({ mutationFn: ({ spinId, reason }: { spinId: string; reason: string }) => wheelApi.void(spinId, reason) });
}

/** Màn tự mở modal khi có người quay (người đang ở màn khác thì nhận toast "Xem"). */
const AUTO_OPEN_PATHS = new Set(['/dashboard', '/chores']);

/**
 * Đồng bộ vòng quay của nhà cho cả app (gắn một lần trong AppShell): ai quay thì mọi máy thấy cùng vòng,
 * kết quả / hủy cập nhật ngay; nối lại thì hỏi `GET /wheel/current` để nhảy tới đúng góc.
 */
export function useWheelRealtime(houseId: string | undefined) {
  const { pathname } = useLocation();
  const me = useAuthStore((s) => s.user?.id);

  useRealtimeEvent('wheel:spinning', (env) => {
    const spin = env.payload as WheelSpin;
    const { show, openModal, open } = useWheelStore.getState();
    if (env.actor?.userId === me) return; // người quay đã có vòng từ phản hồi REST
    if (open || AUTO_OPEN_PATHS.has(pathname)) {
      show(spin, { open: true });
      return;
    }
    show(spin);
    toast(`${firstName(env.actor?.name ?? 'Ai đó')} đang quay vòng quay`, {
      description: spin.taskTitle,
      action: { label: 'Xem', onClick: openModal },
    });
  });

  useRealtimeEvent('wheel:result', (env) => {
    const p = env.payload as { spinId: string; winnerId: string; winnerName: string; assignmentId: string; winnerSlotsToday: number };
    const { active, patch } = useWheelStore.getState();
    const winner = active?.spin.participants.find((x) => x.id === p.winnerId) ?? { id: p.winnerId, name: p.winnerName, avatarUrl: null };
    patch(p.spinId, { status: 'REVEALED', winner, assignmentId: p.assignmentId, winnerSlotsToday: p.winnerSlotsToday });
  });

  useRealtimeEvent('wheel:voided', (env) => {
    const p = env.payload as { spinId: string };
    useWheelStore.getState().patch(p.spinId, { status: 'VOIDED' });
  });

  useRealtimeEvent(RESYNC, () => {
    if (!houseId || !useWheelStore.getState().open) return;
    void wheelApi.current(houseId).then(
      (spin) => spin && useWheelStore.getState().show(spin),
      () => undefined,
    );
  });
}
