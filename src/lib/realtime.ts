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

/**
 * Lắng nghe `events` backend phát tới room người dùng (`user:<id>`: server tự đưa socket vào room
 * khi bắt tay theo token) — không vào room nhà. Payload truyền nguyên cho `onEvent` (lọc kiểu làm
 * ở nơi dùng). Khi socket nối lại thì gọi `onEvent('reconnect', null)` để nơi dùng tải lại dữ liệu
 * có thể đã đổi trong lúc mất mạng. Trả về hàm gỡ (gọi nhiều lần an toàn).
 */
export function bindUserEvents(
  socket: SocketLike,
  events: readonly string[],
  onEvent: (event: string, payload: unknown) => void,
): () => void {
  const listeners = events.map((event) => [event, (payload: unknown) => onEvent(event, payload)] as const);
  // Manager chỉ phát 'reconnect' khi tự nối lại; nối lại chủ động (làm mới token ở socket.ts)
  // chỉ phát 'connect' trên socket nên nghe cả hai đường.
  const onReconnect = () => onEvent('reconnect', null);

  for (const [event, listener] of listeners) socket.on(event, listener);
  socket.on('connect', onReconnect);
  socket.io.on('reconnect', onReconnect);

  if (!socket.connected) socket.connect();

  return () => {
    for (const [event, listener] of listeners) socket.off(event, listener);
    socket.off('connect', onReconnect);
    socket.io.off('reconnect', onReconnect);
  };
}
