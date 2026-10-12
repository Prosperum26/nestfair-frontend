import { io, type Socket } from 'socket.io-client';
import { refreshSession } from '@/lib/api.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

let socket: Socket | null = null;

/**
 * Một kết nối Socket.IO dùng chung cho cả app. Chưa tự kết nối: nơi dùng gọi `connect()`.
 * Token lấy lại mỗi lần (nối lại) từ store nên luôn là access token mới nhất.
 * Dev: để trống VITE_API_URL, Vite proxy /socket.io sang backend (cùng origin).
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(import.meta.env.VITE_API_URL ?? undefined, {
      autoConnect: false,
      withCredentials: true,
      auth: (cb) => cb({ token: useAuthStore.getState().accessToken }),
    });
    // Server ngắt vì token hết hạn thì socket.io không tự nối lại: làm mới phiên rồi nối lại.
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        void refreshSession().then((ok) => {
          if (ok) socket?.connect();
        });
      }
    });
  }
  return socket;
}

/** Đăng xuất: đóng kết nối để không giữ room của phiên cũ. */
export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
