import { io, type Socket } from 'socket.io-client';
import { refreshSession } from '@/lib/api.ts';
import { useAuthStore } from '@/stores/auth-store.ts';

let socket: Socket | null = null;
let retrying = false;
let lastRetryAt = 0;
/** Giãn cách tối thiểu giữa hai lần làm mới phiên để nối lại (tránh vòng lặp khi token vẫn bị từ chối). */
const RETRY_GAP_MS = 5_000;

function reconnectWithFreshToken() {
  if (retrying) return;
  retrying = true;
  const wait = Math.max(0, lastRetryAt + RETRY_GAP_MS - Date.now());
  lastRetryAt = Date.now() + wait;
  void new Promise((r) => setTimeout(r, wait))
    .then(() => refreshSession())
    .then((ok) => {
      if (ok) socket?.connect();
    })
    .finally(() => {
      retrying = false;
    });
}

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
    // Server ngắt (token hết hạn: `session:expired` rồi ngắt) thì socket.io không tự nối lại: làm mới phiên rồi nối lại.
    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') reconnectWithFreshToken();
    });
    // Token bị từ chối lúc bắt tay (AUTH_INVALID): middleware lỗi thì socket.io cũng không tự thử lại.
    socket.on('connect_error', (err: Error & { data?: { code?: string } }) => {
      if (err.data?.code === 'AUTH_INVALID') reconnectWithFreshToken();
    });
  }
  return socket;
}

/** Đăng xuất: đóng kết nối để không giữ room của phiên cũ. */
export function closeSocket() {
  socket?.disconnect();
  socket = null;
}
