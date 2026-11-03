import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '@/features/realtime/context.ts';
import { RESYNC, type RealtimeHandler } from '@/features/realtime/hub.ts';
import { choreKeys } from './hooks.ts';

export const CHORE_EVENTS = [
  'chore:submitted',
  'chore:verified',
  'chore:shuffled',
  'chore:missed',
  'chore:reassigned',
  'chore:cancelled',
] as const;

/** Sự kiện làm lịch trực thay đổi: 6 sự kiện việc nhà, vòng quay ra kết quả / bị hủy, và nối lại sau mất mạng. */
export const SCHEDULE_CHANGE_EVENTS = [...CHORE_EVENTS, 'wheel:result', 'wheel:voided', RESYNC] as const;

type Subscribe = (event: string, handler: RealtimeHandler) => () => void;

/**
 * Gọi `onChange` mỗi khi có sự kiện làm đổi lịch trực (kể cả khi nối lại sau mất mạng).
 * Socket chỉ để báo "có thay đổi": dữ liệu luôn tải lại qua REST. Trả về hàm gỡ.
 */
export function bindChoreRealtime(subscribe: Subscribe, onChange: () => void): () => void {
  const offs = SCHEDULE_CHANGE_EVENTS.map((event) => subscribe(event, () => onChange()));
  return () => offs.forEach((off) => off());
}

/**
 * Khi đang mở modal (check-in, duyệt…) mà có thay đổi từ người khác thì KHÔNG tải lại ngay (sẽ làm modal đổi
 * hoặc đóng đột ngột): chỉ đánh dấu "cần tải lại" để trang hiện banner. Trạng thái modal đọc lúc có sự kiện.
 */
export function createChangeHandler(opts: { isModalOpen: () => boolean; invalidate: () => void; markStale: () => void }): () => void {
  return () => (opts.isModalOpen() ? opts.markStale() : opts.invalidate());
}

/**
 * Đồng bộ lịch trực realtime cho nhà đang xem. `stale` bật khi có thay đổi lúc đang mở modal;
 * gọi `refresh()` (từ banner hoặc khi đóng modal) để tải lại và tắt cờ.
 */
export function useChoresRealtime(houseId: string | undefined, modalOpen: boolean): { stale: boolean; refresh: () => void } {
  const queryClient = useQueryClient();
  const { subscribe } = useSocket();
  const [stale, setStale] = useState(false);
  const modalOpenRef = useRef(modalOpen);
  useEffect(() => {
    modalOpenRef.current = modalOpen;
  }, [modalOpen]);

  const refresh = useCallback(() => {
    setStale(false);
    if (houseId) void queryClient.invalidateQueries({ queryKey: choreKeys.assignments(houseId) });
  }, [houseId, queryClient]);

  useEffect(() => {
    if (!houseId) return;
    const handle = createChangeHandler({
      isModalOpen: () => modalOpenRef.current,
      invalidate: () => void queryClient.invalidateQueries({ queryKey: choreKeys.assignments(houseId) }),
      markStale: () => setStale(true),
    });
    return bindChoreRealtime(subscribe, handle);
  }, [houseId, queryClient, subscribe]);

  return { stale, refresh };
}
