import { describe, expect, it } from 'vitest';
import { sourceLabel } from './source.ts';

describe('sourceLabel', () => {
  it('nhãn nguồn ca theo đặc tả §9', () => {
    expect(sourceLabel('SWAP')).toBe('Đổi ca');
    expect(sourceLabel('COVER')).toBe('Trực dùm');
    expect(sourceLabel('PAYBACK')).toBe('Làm bù');
    expect(sourceLabel('WHEEL')).toBe('Quay may mắn');
    expect(sourceLabel('REASSIGN')).toBe('Giao lại');
  });

  it('lịch xoay bình thường không cần nhãn', () => {
    expect(sourceLabel('ROTATION')).toBeNull();
  });
});
