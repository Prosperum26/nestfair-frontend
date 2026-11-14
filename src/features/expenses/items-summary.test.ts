import { describe, expect, it } from 'vitest';
import { ITEMS_COLLAPSED_COUNT, itemsSummary, visibleItems } from './items-summary.ts';

describe('itemsSummary', () => {
  it('tổng hóa đơn nhỏ hơn tổng món: điều chỉnh âm (giảm giá)', () => {
    // Hóa đơn VinCommerce: các món cộng 545.500đ, khách trả 353.300đ.
    const items = [{ lineTotal: 149_625 }, { lineTotal: 159_075 }, { lineTotal: 36_400 }, { lineTotal: 40_500 }, { lineTotal: 159_900 }];
    expect(itemsSummary(353_300, items)).toEqual({ itemsTotal: 545_500, adjustment: -192_200 });
  });

  it('tổng hóa đơn lớn hơn tổng món: điều chỉnh dương (phí)', () => {
    expect(itemsSummary(110_000, [{ lineTotal: 60_000 }, { lineTotal: 40_000 }])).toEqual({ itemsTotal: 100_000, adjustment: 10_000 });
  });

  it('bằng nhau thì điều chỉnh 0 (UI không hiện dòng thừa)', () => {
    expect(itemsSummary(100_000, [{ lineTotal: 60_000 }, { lineTotal: 40_000 }])).toEqual({ itemsTotal: 100_000, adjustment: 0 });
  });

  it('không có món thì tổng món 0 và điều chỉnh bằng cả tổng hóa đơn', () => {
    expect(itemsSummary(50_000, [])).toEqual({ itemsTotal: 0, adjustment: 50_000 });
  });
});

describe('visibleItems', () => {
  const ten = Array.from({ length: 10 }, (_, i) => i);

  it('thu gọn: chỉ ITEMS_COLLAPSED_COUNT (6) món đầu', () => {
    expect(ITEMS_COLLAPSED_COUNT).toBe(6);
    expect(visibleItems(ten, false)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('mở rộng: đủ mọi món', () => {
    expect(visibleItems(ten, true)).toEqual(ten);
  });

  it('không quá 6 món thì thu gọn hay không cũng đủ', () => {
    expect(visibleItems([1, 2, 3], false)).toEqual([1, 2, 3]);
    expect(visibleItems(ten.slice(0, 6), false)).toHaveLength(6);
  });
});
