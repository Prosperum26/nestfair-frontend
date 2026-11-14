import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { choreKeys } from '@/features/chores/hooks.ts';
import { useSocket } from '@/features/realtime/context.ts';
import { RESYNC, type RealtimeHandler } from '@/features/realtime/hub.ts';
import { swapKeys } from './keys.ts';

export const SWAP_EVENTS = ['swap:requested', 'swap:accepted', 'swap:rejected', 'swap:expired', 'swap:cancelled', 'swap:escalated'] as const;
export const DEBT_EVENTS = ['chore_debt:created', 'chore_debt:pick_requested', 'chore_debt:paid', 'chore_debt:forgiven'] as const;
/** Mọi sự kiện làm đổi danh sách yêu cầu hoặc sổ nợ, cộng với nối lại sau mất mạng. */
export const SWAP_CHANGE_EVENTS = [...SWAP_EVENTS, ...DEBT_EVENTS, RESYNC] as const;

/** Nhiều sự kiện ập đến cùng lúc (accept kéo theo debt, activity…) chỉ tải lại một lần. */
export const SWAP_DEBOUNCE_MS = 300;

type Subscribe = (event: string, handler: RealtimeHandler) => () => void;

/**
 * Gọi `onChange` (debounce 300 ms) mỗi khi có sự kiện đổi ca hoặc nợ ca. Socket chỉ để báo "có thay đổi":
 * dữ liệu luôn tải lại qua REST, và mọi thay đổi ghi đi qua REST. Trả về hàm gỡ (hủy cả lần gọi đang chờ).
 */
export function bindSwapRealtime(subscribe: Subscribe, onChange: () => void, debounceMs = SWAP_DEBOUNCE_MS): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      onChange();
    }, debounceMs);
  };
  const offs = SWAP_CHANGE_EVENTS.map((event) => subscribe(event, schedule));
  return () => {
    if (timer) clearTimeout(timer);
    timer = null;
    offs.forEach((off) => off());
  };
}

/** Đổi ca đổi cả lịch trực (đổi người làm), nên tải lại luôn lịch cùng với danh sách yêu cầu và sổ nợ. */
export function invalidateSwapData(client: { invalidateQueries: (filters: { queryKey: readonly unknown[] }) => unknown }, houseId: string): void {
  void client.invalidateQueries({ queryKey: swapKeys.all(houseId) });
  void client.invalidateQueries({ queryKey: swapKeys.debts(houseId) });
  void client.invalidateQueries({ queryKey: choreKeys.assignments(houseId) });
}

/** Đồng bộ realtime yêu cầu đổi ca, Chợ ca, widget và sổ nợ cho nhà đang xem. */
export function useSwapRealtime(houseId: string | undefined): void {
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();
  useEffect(() => {
    if (!houseId) return;
    return bindSwapRealtime(subscribe, () => invalidateSwapData(queryClient, houseId));
  }, [houseId, queryClient, subscribe]);
}
