import { describe, expect, it } from 'vitest';
import { BANNER_AFTER_MS, connectionStatus, OFFLINE_AFTER_MS, showReconnectBanner } from './connection.ts';

describe('connectionStatus', () => {
  it('đang kết nối', () => {
    expect(connectionStatus(null, 1000)).toBe('connected');
    expect(showReconnectBanner(null, 1000)).toBe(false);
  });

  it('mất kết nối: banner chỉ hiện sau 5 giây, "Mất kết nối" sau 30 giây', () => {
    const at = 10_000;
    expect(connectionStatus(at, at + 1000)).toBe('reconnecting');
    expect(showReconnectBanner(at, at + BANNER_AFTER_MS - 1)).toBe(false);
    expect(showReconnectBanner(at, at + BANNER_AFTER_MS)).toBe(true);
    expect(connectionStatus(at, at + OFFLINE_AFTER_MS - 1)).toBe('reconnecting');
    expect(connectionStatus(at, at + OFFLINE_AFTER_MS)).toBe('offline');
  });
});
