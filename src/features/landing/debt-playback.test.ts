import { describe, expect, it } from 'vitest';
import { AFTER_DELAY_MS, debtPlayback, initialPlayback } from './debt-playback.ts';

describe('debtPlayback', () => {
  it('chưa cuộn tới thì chưa vẽ; cuộn tới thì vẽ 6 khoản nợ chéo; vẽ xong thì gom còn 2 giao dịch', () => {
    let s = initialPlayback(false);
    expect(s).toEqual({ phase: 'idle', run: 0 });
    s = debtPlayback(s, 'enter');
    expect(s.phase).toBe('before');
    s = debtPlayback(s, 'drawn');
    expect(s).toEqual({ phase: 'after', run: 0 });
  });

  it('Xem lại chạy lại từ đầu với lượt mới (để sơ đồ vẽ lại từ trống)', () => {
    const s = debtPlayback({ phase: 'after', run: 0 }, 'replay');
    expect(s).toEqual({ phase: 'before', run: 1 });
  });

  it('bỏ qua sự kiện không hợp lệ: vào lại khung nhìn khi đang chạy, xong khi chưa bắt đầu', () => {
    expect(debtPlayback({ phase: 'before', run: 0 }, 'enter')).toEqual({ phase: 'before', run: 0 });
    expect(debtPlayback({ phase: 'idle', run: 0 }, 'drawn')).toEqual({ phase: 'idle', run: 0 });
    expect(debtPlayback({ phase: 'idle', run: 0 }, 'replay')).toEqual({ phase: 'idle', run: 0 });
  });

  it('giảm chuyển động thì hiện ngay kết quả sau khi rút gọn', () => {
    expect(initialPlayback(true)).toEqual({ phase: 'after', run: 0 });
  });

  it('gom sau khi 6 đường nợ đã vẽ xong', () => {
    expect(AFTER_DELAY_MS).toBe(1100);
  });
});
