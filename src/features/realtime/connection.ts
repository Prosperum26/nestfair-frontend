export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

/** Mất kết nối lâu hơn thế này mới hiện banner "Đang kết nối lại…" (tránh nháy khi mạng chập chờn). */
export const BANNER_AFTER_MS = 5_000;
/** Mất kết nối lâu hơn thế này thì coi là "Mất kết nối". */
export const OFFLINE_AFTER_MS = 30_000;

/** `disconnectedAt` = lúc mất kết nối (null khi đang kết nối, hoặc chưa từng nối được nhưng đang thử). */
export function connectionStatus(disconnectedAt: number | null, now: number): ConnectionStatus {
  if (disconnectedAt === null) return 'connected';
  return now - disconnectedAt >= OFFLINE_AFTER_MS ? 'offline' : 'reconnecting';
}

export function showReconnectBanner(disconnectedAt: number | null, now: number): boolean {
  return disconnectedAt !== null && now - disconnectedAt >= BANNER_AFTER_MS;
}

export const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connected: 'Trực tuyến',
  reconnecting: 'Đang kết nối lại…',
  offline: 'Mất kết nối',
};
