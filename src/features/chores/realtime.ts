import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket } from '@/lib/socket.ts';
import { choreKeys } from './hooks.ts';

export const CHORE_EVENTS = [
  'chore:submitted',
  'chore:verified',
  'chore:shuffled',
  'chore:missed',
  'chore:reassigned',
  'chore:cancelled',
] as const;

/** Phần của socket.io-client mà bindChoreRealtime dùng (để test bằng socket giả). */
export interface SocketLike {
  connected: boolean;
  connect: () => unknown;
  emit: (event: string, ...args: unknown[]) => unknown;
  on: (event: string, listener: (...args: unknown[]) => void) => unknown;
  off: (event: string, listener: (...args: unknown[]) => void) => unknown;
  io: {
    on: (event: string, listener: (...args: unknown[]) => void) => unknown;
    off: (event: string, listener: (...args: unknown[]) => void) => unknown;
  };
}

/**
 * Vào room nhà, gọi `onChange` mỗi khi có event việc nhà và khi nối lại sau mất mạng.
 * Socket chỉ để báo "có thay đổi": dữ liệu luôn tải lại qua REST. Trả về hàm gỡ.
 */
export function bindChoreRealtime(socket: SocketLike, houseId: string, onChange: () => void): () => void {
  const join = () => socket.emit('house:join_room', { houseId });
  const change = () => onChange();

  socket.on('connect', join);
  for (const event of CHORE_EVENTS) socket.on(event, change);
  // Manager 'reconnect' chỉ bắn khi nối LẠI (không bắn ở lần nối đầu), đúng ý "reconnect thì tải lại".
  socket.io.on('reconnect', change);

  if (socket.connected) join();
  else socket.connect();

  return () => {
    socket.off('connect', join);
    for (const event of CHORE_EVENTS) socket.off(event, change);
    socket.io.off('reconnect', change);
  };
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
    return bindChoreRealtime(getSocket() as unknown as SocketLike, houseId, handle);
  }, [houseId, queryClient]);

  return { stale, refresh };
}
