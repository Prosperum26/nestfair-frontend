/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { cssMotionVars, delayed, distance, duration, ease, spring, variants, viewport } from './motion.ts';

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

  it('hiệu ứng theo cuộn chỉ chạy một lần, khi khối đã vào khung nhìn một phần', () => {
    expect(viewport).toEqual({ once: true, amount: 0.25 });
  });

  it('vệt dạ quang và đường nối vẽ từ 0 tới đủ, thẻ rơi xuống từ phía trên', () => {
    expect(variants.markerSweep.hidden).toEqual({ scaleX: 0 });
    expect(variants.markerSweep.visible).toMatchObject({ scaleX: 1 });
    expect(variants.drawLine.hidden).toEqual({ pathLength: 0, opacity: 0 });
    expect(variants.drawLine.visible).toMatchObject({ pathLength: 1, opacity: 1 });
    expect(variants.dropIn.hidden).toEqual({ opacity: 0, y: -distance.md });
    expect(variants.staggerGroup.visible).toMatchObject({ transition: { staggerChildren: 0.08 } });
  });

  it('delayed gộp độ trễ vào transition của trạng thái visible, giữ nguyên thời lượng và trạng thái hidden', () => {
    const v = delayed(variants.dropIn, 0.4);
    expect(v.hidden).toEqual(variants.dropIn.hidden);
    expect(v.visible).toMatchObject({ opacity: 1, y: 0, transition: { duration: duration.slow, delay: 0.4 } });
    expect(variants.dropIn.visible).not.toHaveProperty('transition.delay');
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
