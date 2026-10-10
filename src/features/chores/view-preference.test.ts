import { afterEach, describe, expect, it, vi } from 'vitest';
import { readView, writeView } from './view-preference.ts';

afterEach(() => vi.unstubAllGlobals());

describe('view preference', () => {
  it('mặc định là lịch tuần khi chưa lưu', () => {
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() });
    expect(readView()).toBe('calendar');
  });

  it('đọc lại giá trị hợp lệ đã lưu, bỏ qua giá trị lạ', () => {
    vi.stubGlobal('localStorage', { getItem: () => 'kanban', setItem: vi.fn() });
    expect(readView()).toBe('kanban');
    vi.stubGlobal('localStorage', { getItem: () => 'wat', setItem: vi.fn() });
    expect(readView()).toBe('calendar');
  });

  it('localStorage bị chặn (chế độ riêng tư) thì không ném lỗi', () => {
    const blocked = () => {
      throw new Error('blocked');
    };
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked });
    expect(readView()).toBe('calendar');
    expect(() => writeView('kanban')).not.toThrow();
  });
});
