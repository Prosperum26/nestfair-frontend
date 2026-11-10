import { describe, expect, it } from 'vitest';
import { buttonClass } from './button-class.ts';

describe('buttonClass', () => {
  it('nút accent lún 2px và bóng thu về 1px khi nhấn (như ấn lên giấy)', () => {
    const cls = buttonClass({ variant: 'accent' });
    expect(cls).toContain('active:translate-x-[2px]');
    expect(cls).toContain('active:translate-y-[2px]');
    expect(cls).toContain('active:shadow-[1px_1px_0_var(--color-ink)]');
    expect(cls).not.toContain('active:shadow-none');
  });

  it('nút primary / danger lún nhẹ 1px, không có bóng', () => {
    for (const variant of ['primary', 'danger'] as const) {
      const cls = buttonClass({ variant });
      expect(cls).toContain('active:translate-y-px');
      expect(cls).not.toContain('shadow-hard');
    }
  });

  it('chuyển cảnh dùng token thời lượng và easing', () => {
    const cls = buttonClass();
    expect(cls).toContain('duration-[var(--dur-fast)]');
    expect(cls).toContain('ease-[var(--ease-out)]');
    expect(cls).toContain('transition-[color,background-color,border-color,box-shadow,translate]');
  });

  it('ghost / secondary không lún', () => {
    for (const variant of ['ghost', 'secondary'] as const) expect(buttonClass({ variant })).not.toContain('active:translate');
  });
});
