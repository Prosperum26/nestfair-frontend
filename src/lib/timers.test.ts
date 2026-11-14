import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTimers } from './timers.ts';

describe('createTimers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('chạy hàm sau đúng thời gian hẹn', () => {
    const timers = createTimers();
    const fn = vi.fn();
    timers.after(700, fn);
    vi.advanceTimersByTime(699);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('clearAll hủy mọi hẹn giờ còn chờ: modal đã đóng thì không đóng nhầm modal mở sau', () => {
    const timers = createTimers();
    const onClose = vi.fn();
    timers.after(700, onClose);
    timers.after(300, onClose);
    timers.clearAll();
    vi.advanceTimersByTime(1000);
    expect(onClose).not.toHaveBeenCalled();
  });
});
