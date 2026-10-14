import { describe, expect, it } from 'vitest';
import { CATEGORIES, CATEGORY_META, categoryBarSegments, SELECTABLE_CATEGORIES } from './category.ts';

describe('category', () => {
  it('đủ 8 danh mục của đặc tả, nhãn không trùng', () => {
    expect(CATEGORIES).toHaveLength(8);
    expect(new Set(CATEGORIES.map((c) => CATEGORY_META[c].label)).size).toBe(8);
  });

  it('người dùng không tự chọn được GIFT', () => {
    expect(SELECTABLE_CATEGORIES).not.toContain('GIFT');
    expect(SELECTABLE_CATEGORIES).toHaveLength(7);
  });

  it('thanh danh mục: theo tỉ lệ, tổng 100%, bỏ mục 0đ', () => {
    const seg = categoryBarSegments([
      { category: 'ELECTRICITY', amount: 840_000 },
      { category: 'FOOD', amount: 520_000 },
      { category: 'OTHER', amount: 0 },
    ]);
    expect(seg.map((s) => s.category)).toEqual(['ELECTRICITY', 'FOOD']);
    expect(seg.reduce((s, x) => s + x.percent, 0)).toBeCloseTo(100);
    expect(seg[0].percent).toBeCloseTo((840 / 1360) * 100);
  });

  it('đoạn rất nhỏ vẫn tối thiểu 2% và tổng vẫn 100%', () => {
    const seg = categoryBarSegments([
      { category: 'RENT', amount: 3_000_000 },
      { category: 'WATER', amount: 1_000 },
    ]);
    expect(seg[1].percent).toBe(2);
    expect(seg.reduce((s, x) => s + x.percent, 0)).toBeCloseTo(100);
  });

  it('không có chi tiêu thì không có đoạn nào', () => {
    expect(categoryBarSegments([])).toEqual([]);
  });
});
