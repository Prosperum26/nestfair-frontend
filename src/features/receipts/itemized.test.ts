import { describe, expect, it } from 'vitest';
import { previewItemized } from './itemized.ts';

const asMap = (shares: { userId: string; amount: number }[]) => Object.fromEntries(shares.map((s) => [s.userId, s.amount]));
const sum = (shares: { amount: number }[]) => shares.reduce((s, x) => s + x.amount, 0);

/** LCG có seed: test ngẫu nhiên nhưng tái lập được. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('previewItemized: khớp backend (cùng vector V1–V5 với expenses/algorithms/split.spec.ts)', () => {
  const HTMQ = ['H', 'T', 'M', 'Q'];

  it('V1 (ảnh 18): hóa đơn Bách Hóa Xanh 245.000đ', () => {
    const p = previewItemized({
      total: 245_000,
      memberIds: HTMQ,
      items: [
        { lineTotal: 32_000, userIds: HTMQ },
        { lineTotal: 15_000, userIds: HTMQ },
        { lineTotal: 108_000, userIds: ['H', 'Q'] },
        { lineTotal: 64_000, userIds: ['M'] },
        { lineTotal: 26_000, userIds: HTMQ },
      ],
    });
    expect(asMap(p.shares)).toEqual({ H: 72_250, T: 18_250, M: 82_250, Q: 72_250 });
    expect(p.shares.map((s) => s.userId)).toEqual(HTMQ);
    expect(p).toMatchObject({ itemsSum: 245_000, diff: 0, unassigned: [], invalid: [], ok: true });
  });

  it('V2 (giảm giá): phần chênh trừ theo tỷ lệ tiền món', () => {
    const p = previewItemized({
      total: 100_000,
      memberIds: ['a', 'b', 'c'],
      items: [
        { lineTotal: 60_000, userIds: ['a', 'b', 'c'] },
        { lineTotal: 50_000, userIds: ['a'] },
      ],
    });
    expect(asMap(p.shares)).toEqual({ a: 63_636, b: 18_182, c: 18_182 });
    expect(p).toMatchObject({ itemsSum: 110_000, diff: -10_000, ok: true });
  });

  it('V3 (phí): phần chênh cộng theo tỷ lệ', () => {
    const p = previewItemized({ total: 33_000, memberIds: ['a', 'b', 'c'], items: [{ lineTotal: 30_000, userIds: ['a', 'b'] }] });
    expect(asMap(p.shares)).toEqual({ a: 16_500, b: 16_500 });
    expect(p.diff).toBe(3_000);
  });

  it('V4 (dư 1đ): người đứng đầu thứ tự thành viên nhận 1đ dư', () => {
    const p = previewItemized({ total: 10_001, memberIds: ['a', 'b', 'c'], items: [{ lineTotal: 10_000, userIds: ['a', 'b'] }] });
    expect(asMap(p.shares)).toEqual({ a: 5_001, b: 5_000 });
  });

  it('V5 (số lớn): tích vượt 2^53 vẫn chính xác nhờ BigInt', () => {
    expect(100_000_000 * 700_000_000).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    const p = previewItemized({
      total: 1_000_000_000,
      memberIds: ['a', 'b', 'c'],
      items: [
        { lineTotal: 500_000_000, userIds: ['a'] },
        { lineTotal: 400_000_000, userIds: ['a', 'b'] },
      ],
    });
    expect(asMap(p.shares)).toEqual({ a: 777_777_778, b: 222_222_222 });
    expect(p.ok).toBe(true);
  });

  it('bất biến: Σ phần chia luôn bằng total, không phần nào âm (200 ca ngẫu nhiên có seed)', () => {
    const rnd = rng(20261019);
    const pick = (n: number) => Math.floor(rnd() * n);
    for (let run = 0; run < 200; run++) {
      const people = Array.from({ length: 2 + pick(5) }, (_, i) => 'u' + i);
      const items = Array.from({ length: 1 + pick(8) }, () => {
        const userIds = people.filter(() => rnd() < 0.5);
        return { lineTotal: 1 + pick(300_000_000), userIds: userIds.length ? userIds : [people[pick(people.length)]] };
      });
      const total = 1 + pick(1_000_000_000);
      const p = previewItemized({ total, memberIds: people, items });
      expect(p.ok, 'run ' + run).toBe(true);
      expect(sum(p.shares), 'run ' + run).toBe(total);
      for (const s of p.shares) expect(s.amount, 'run ' + run).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('previewItemized: chưa hợp lệ thì vẫn cho xem số đang gán, không ném lỗi', () => {
  const members = ['a', 'b'];

  it('món chưa gán ai → unassigned chứa chỉ số, ok = false; phần mỗi người là phần món đã gán (chưa phân bổ chênh)', () => {
    const p = previewItemized({
      total: 100_000,
      memberIds: members,
      items: [
        { lineTotal: 60_000, userIds: ['a', 'b'] },
        { lineTotal: 40_000, userIds: [] },
      ],
    });
    expect(p.unassigned).toEqual([1]);
    expect(p.ok).toBe(false);
    expect(asMap(p.shares)).toEqual({ a: 30_000, b: 30_000 });
  });

  it('tiền món rỗng, 0, âm hoặc lẻ → invalid chứa chỉ số, ok = false, món đó không tính vào phần chia', () => {
    const p = previewItemized({
      total: 50_000,
      memberIds: members,
      items: [
        { lineTotal: 50_000, userIds: ['a'] },
        { lineTotal: null, userIds: ['a'] },
        { lineTotal: 0, userIds: ['b'] },
        { lineTotal: -5_000, userIds: ['b'] },
        { lineTotal: 1_500.5, userIds: ['b'] },
      ],
    });
    expect(p.invalid).toEqual([1, 2, 3, 4]);
    expect(p.ok).toBe(false);
    expect(asMap(p.shares)).toEqual({ a: 50_000 });
    expect(p.itemsSum).toBe(50_000);
  });

  it('thiếu tổng hóa đơn (null, 0) hoặc không có món → ok = false, không ném lỗi', () => {
    const items = [{ lineTotal: 10_000, userIds: ['a'] }];
    expect(previewItemized({ total: null, memberIds: members, items }).ok).toBe(false);
    expect(previewItemized({ total: 0, memberIds: members, items }).ok).toBe(false);
    const empty = previewItemized({ total: 10_000, memberIds: members, items: [] });
    expect(empty).toMatchObject({ ok: false, shares: [], itemsSum: 0 });
  });

  it('người ngoài danh sách thành viên (đã rời nhà) vẫn nhận phần và đứng sau cùng', () => {
    const p = previewItemized({ total: 10, memberIds: ['a', 'b'], items: [{ lineTotal: 10, userIds: ['x', 'b', 'a'] }] });
    expect(p.shares.map((s) => s.userId)).toEqual(['a', 'b', 'x']);
    expect(sum(p.shares)).toBe(10);
  });
});
