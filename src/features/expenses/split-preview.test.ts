import { describe, expect, it } from 'vitest';
import { previewSplit, toExpenseInput } from './split-preview.ts';

const members = ['hung', 'thien', 'mai', 'quan'];

describe('previewSplit (cùng thuật toán với backend split.ts)', () => {
  it('EQUAL: chia cả nhà, dư 1đ cho người đứng đầu danh sách (100.000đ / 3 người như test backend)', () => {
    const p = previewSplit({ splitType: 'EQUAL', total: 100_000, memberIds: ['a', 'b', 'c'], participants: [], exact: {} });
    expect(p.shares).toEqual([
      { userId: 'a', amount: 33_334 },
      { userId: 'b', amount: 33_333 },
      { userId: 'c', amount: 33_333 },
    ]);
    expect(p).toMatchObject({ assigned: 100_000, diff: 0, ok: true });
  });

  it('EQUAL 840.000đ cho 4 người: 210.000đ mỗi người (khớp Design.md mục 7)', () => {
    const p = previewSplit({ splitType: 'EQUAL', total: 840_000, memberIds: members, participants: [], exact: {} });
    expect(p.shares.map((s) => s.amount)).toEqual([210_000, 210_000, 210_000, 210_000]);
  });

  it('CUSTOM: chỉ người được chọn, theo thứ tự thành viên (không theo thứ tự tích)', () => {
    const p = previewSplit({ splitType: 'CUSTOM', total: 100_001, memberIds: members, participants: ['mai', 'thien'], exact: {} });
    expect(p.shares).toEqual([
      { userId: 'thien', amount: 50_001 },
      { userId: 'mai', amount: 50_000 },
    ]);
    expect(p.ok).toBe(true);
  });

  it('CUSTOM không chọn ai thì chưa hợp lệ', () => {
    const p = previewSplit({ splitType: 'CUSTOM', total: 100_000, memberIds: members, participants: [], exact: {} });
    expect(p.ok).toBe(false);
    expect(p.shares).toEqual([]);
  });

  it('EXACT: thiết kế 08 "Còn thiếu 30.000đ" (420.000 / 450.000)', () => {
    const p = previewSplit({
      splitType: 'EXACT',
      total: 450_000,
      memberIds: members,
      participants: members,
      exact: { hung: 120_000, thien: 100_000, mai: 100_000, quan: 100_000 },
    });
    expect(p).toMatchObject({ assigned: 420_000, diff: 30_000, ok: false });
  });

  it('EXACT: thừa tiền thì diff âm; khớp thì ok; ô trống tính 0đ; người bỏ tích không tính', () => {
    const over = previewSplit({ splitType: 'EXACT', total: 100, memberIds: members, participants: ['hung', 'mai'], exact: { hung: 80, mai: 40 } });
    expect(over.diff).toBe(-20);
    const ok = previewSplit({ splitType: 'EXACT', total: 100, memberIds: members, participants: ['hung', 'mai'], exact: { hung: 100, mai: null, quan: 999 } });
    expect(ok).toMatchObject({ assigned: 100, diff: 0, ok: true });
    expect(ok.shares).toEqual([
      { userId: 'hung', amount: 100 },
      { userId: 'mai', amount: 0 },
    ]);
  });

  it('chưa nhập tổng tiền thì chưa hợp lệ, phần chia bằng 0', () => {
    const p = previewSplit({ splitType: 'EQUAL', total: null, memberIds: members, participants: [], exact: {} });
    expect(p.ok).toBe(false);
    expect(p.shares.every((s) => s.amount === 0)).toBe(true);
  });
});

describe('toExpenseInput', () => {
  const base = {
    title: 'Pizza',
    date: '2026-10-10',
    totalAmount: 450_000,
    payerId: 'hung',
    category: 'FOOD' as const,
    participants: members,
    exact: { hung: 150_000, thien: 100_000, mai: 100_000, quan: 100_000 },
    note: '',
    receiptImageUrl: null,
  };

  it('EQUAL: không gửi danh sách người; ngày → 12:00 giờ VN', () => {
    expect(toExpenseInput({ ...base, splitType: 'EQUAL' })).toEqual({
      title: 'Pizza',
      category: 'FOOD',
      totalAmount: 450_000,
      payerId: 'hung',
      splitType: 'EQUAL',
      spentAt: '2026-10-10T12:00:00+07:00',
      note: null,
      receiptImageUrl: null,
    });
  });

  it('CUSTOM gửi participantIds; EXACT gửi splits của người được tích', () => {
    expect(toExpenseInput({ ...base, splitType: 'CUSTOM', participants: ['mai', 'hung'] }).participantIds).toEqual(['mai', 'hung']);
    const exact = toExpenseInput({ ...base, splitType: 'EXACT', participants: ['hung', 'thien'], exact: { hung: 300_000, thien: 150_000, mai: 1 } });
    expect(exact.splits).toEqual([
      { userId: 'hung', amount: 300_000 },
      { userId: 'thien', amount: 150_000 },
    ]);
    expect(exact.participantIds).toBeUndefined();
  });
});
