import { describe, expect, it } from 'vitest';
import { withPrefillExtras } from './prefill.ts';
import type { ExpenseInput } from './types.ts';

const body: ExpenseInput = { title: 'Đi chợ', category: 'FOOD', totalAmount: 100_000, splitType: 'EQUAL' };

describe('withPrefillExtras', () => {
  it('thêm receiptScanId của bản nháp OCR', () => {
    expect(withPrefillExtras(body, { receiptScanId: 'scan-1' })).toEqual({ ...body, receiptScanId: 'scan-1' });
  });

  it('thêm items của hóa đơn với userIds rỗng (không chia theo món)', () => {
    const out = withPrefillExtras(body, { items: [{ name: 'Rau', lineTotal: 15_000 }, { name: 'Sữa', lineTotal: 64_000 }] });
    expect(out.items).toEqual([
      { name: 'Rau', lineTotal: 15_000, userIds: [] },
      { name: 'Sữa', lineTotal: 64_000, userIds: [] },
    ]);
  });

  it('không có prefill hoặc prefill không có items thì giữ nguyên body', () => {
    expect(withPrefillExtras(body, undefined)).toEqual(body);
    expect(withPrefillExtras(body, { title: 'x', items: [] })).toEqual(body);
    expect('items' in withPrefillExtras(body, { receiptScanId: 's' })).toBe(false);
  });

  it('không làm thay đổi body gốc', () => {
    const copy = { ...body };
    withPrefillExtras(body, { receiptScanId: 's', items: [{ name: 'a', lineTotal: 1 }] });
    expect(body).toEqual(copy);
  });
});
