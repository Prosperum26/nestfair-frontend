import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
const block = (selector: string) => css.slice(css.indexOf(selector), css.indexOf('}', css.indexOf(selector)) + 1);

describe('hiệu ứng dẫn mắt (CSS)', () => {
  it('nf-rise: vào màn lần lượt theo --i, dùng token thời lượng, dịch tối đa 8px, không blur', () => {
    const rule = block('.nf-rise {');
    expect(rule).toContain('var(--dur-slow)');
    expect(rule).toContain('var(--i, 0)');
    const keyframes = block('@keyframes nf-rise');
    expect(keyframes).toMatch(/translateY\(8px\)/);
    expect(css).not.toMatch(/nf-rise[^}]*blur/);
  });

  it('nf-attn: nhịp chú ý chỉ lặp 3 lần rồi dừng, bóng đặc không blur', () => {
    const rule = block('.nf-attn {');
    expect(rule).toMatch(/animation:[^;]*\b3\b/);
    expect(block('@keyframes nf-attn')).not.toContain('blur');
  });

  it('giảm chuyển động tắt cả hai (hiện nội dung ngay)', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\.nf-rise,\s*\.nf-attn \{\s*animation: none;/);
  });
});
