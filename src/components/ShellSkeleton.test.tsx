import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { DelayedLoader } from './DelayedLoader.tsx';
import { LOADER_DELAY_MS, shouldShowLoader } from './delayed.ts';
import { ShellSkeleton } from './ShellSkeleton.tsx';

describe('shouldShowLoader', () => {
  it('chỉ hiện spinner khi chờ từ 300ms trở lên (dưới mốc đó không nháy)', () => {
    expect(LOADER_DELAY_MS).toBe(300);
    expect(shouldShowLoader(0)).toBe(false);
    expect(shouldShowLoader(299)).toBe(false);
    expect(shouldShowLoader(300)).toBe(true);
  });
});

describe('DelayedLoader', () => {
  it('lần render đầu chưa hiện gì', () => {
    expect(renderToStaticMarkup(<DelayedLoader label="Đang tải phiên đăng nhập" />)).toBe('');
  });
});

describe('ShellSkeleton', () => {
  const html = renderToStaticMarkup(<ShellSkeleton label="Đang tải nhà của bạn" />);

  it('là vùng trạng thái có nhãn cho trình đọc màn hình', () => {
    expect(html).toContain('role="status"');
    expect(html).toContain('Đang tải nhà của bạn');
  });

  it('dựng khung giống AppShell: top nav desktop h72, top bar mobile h64, tab bar dưới', () => {
    expect(html).toContain('h-[72px]');
    expect(html).toContain('h-16');
    expect(html).toMatch(/fixed[^"]*bottom-0/);
  });

  it('không dùng spinner', () => {
    expect(html).not.toContain('animate-spin');
  });
});
