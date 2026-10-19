/** Phần của socket.io-client mà bindHouseEvents dùng (để test bằng socket giả). */
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
 * Vào room `house:<id>`, gọi `onChange` khi có một trong `events` và khi nối lại sau mất mạng.
 * Socket chỉ báo "có thay đổi": dữ liệu luôn tải lại qua REST (AGENTS.md mục 5). Trả về hàm gỡ.
 */
export function bindHouseEvents(socket: SocketLike, houseId: string, events: readonly string[], onChange: () => void): () => void {
  const join = () => socket.emit('house:join_room', { houseId });
  const change = () => onChange();

  socket.on('connect', join);
  for (const event of events) socket.on(event, change);
  socket.io.on('reconnect', change);

  if (socket.connected) join();
  else socket.connect();

  return () => {
    socket.off('connect', join);
    for (const event of events) socket.off(event, change);
    socket.io.off('reconnect', change);
  };
}
