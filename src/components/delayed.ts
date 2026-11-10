/** Chờ ngắn hơn mốc này thì không hiện spinner, tránh nháy màn hình khi phiên khôi phục nhanh. */
export const LOADER_DELAY_MS = 300;

export const shouldShowLoader = (elapsedMs: number): boolean => elapsedMs >= LOADER_DELAY_MS;
