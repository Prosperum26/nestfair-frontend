import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getSocket } from '@/lib/socket.ts';
import { choreKeys } from './hooks.ts';

export const CHORE_EVENTS = ['chore:submitted', 'chore:verified', 'chore:shuffled'] as const;

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

/** Đồng bộ lịch trực realtime cho nhà đang xem. */
export function useChoresRealtime(houseId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!houseId) return;
    return bindChoreRealtime(getSocket() as unknown as SocketLike, houseId, () => {
      void queryClient.invalidateQueries({ queryKey: choreKeys.assignments(houseId) });
    });
  }, [houseId, queryClient]);
}
