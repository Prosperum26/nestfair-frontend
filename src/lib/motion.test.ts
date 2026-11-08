/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cssMotionVars, distance, duration, ease, spring, variants } from './motion.ts';

describe('token chuyển động', () => {
  it('khai báo đúng giá trị token của spec', () => {
    expect(duration).toEqual({ fast: 0.12, base: 0.2, slow: 0.32 });
    expect(ease.out).toEqual([0.2, 0, 0, 1]);
    expect(ease.in).toEqual([0.4, 0, 1, 1]);
    expect(distance).toEqual({ sm: 4, md: 8 });
    expect(spring.stamp).toEqual({ type: 'spring', stiffness: 520, damping: 22 });
  });

  it('biến CSS trong index.css khớp token', () => {
    // Vitest thay file .css bằng chuỗi rỗng khi import, nên đọc thẳng từ đĩa.
    const css = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
    for (const [name, value] of Object.entries(cssMotionVars)) expect(css).toContain(`${name}: ${value};`);
  });

  it('không variant nào dịch quá 8px hay scale dưới 0.96 (trừ stampIn)', () => {
    const offenders: string[] = [];
    for (const [name, variant] of Object.entries(variants)) {
      if (name === 'stampIn') continue;
      for (const [state, target] of Object.entries(variant)) {
        const t = target as Record<string, unknown>;
        for (const axis of ['x', 'y'] as const) {
          if (typeof t[axis] === 'number' && Math.abs(t[axis]) > distance.md) offenders.push(`${name}.${state}.${axis}`);
        }
        if (typeof t.scale === 'number' && t.scale < 0.96) offenders.push(`${name}.${state}.scale`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
