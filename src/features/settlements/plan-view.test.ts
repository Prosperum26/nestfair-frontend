import { describe, expect, it } from 'vitest';
import { edgeGeometry, graphLayout, myPosition, netSummary, transferRole } from './plan-view.ts';
import type { PlanMember, SettlementPlan } from './types.ts';

const m = (id: string, fullName: string, net: number): PlanMember => ({ id, fullName, avatarUrl: null, active: true, net });
const plan: SettlementPlan = {
  members: [m('H', 'Trần Minh Hùng', -170_000), m('T', 'Lê Đức Thiện', -380_000), m('M', 'Phạm Ngọc Mai', 380_000), m('Q', 'Nguyễn Minh Quân', 170_000)],
  raw: [],
  optimized: [
    { fromUserId: 'T', toUserId: 'M', amount: 380_000, pending: { id: 's1', amount: 380_000, createdAt: '2026-10-06T01:15:00Z', proofUrl: null } },
    { fromUserId: 'H', toUserId: 'Q', amount: 170_000, pending: null },
  ],
  rawTotal: 640_000,
  optimizedTotal: 550_000,
};

describe('myPosition', () => {
  it('Hùng: nợ ròng 170k, cần trả Quân, không được nhận ai', () => {
    const p = myPosition(plan, 'H');
    expect(p.net).toBe(-170_000);
    expect(p.toPay.map((t) => t.toUserId)).toEqual(['Q']);
    expect(p.toReceive).toEqual([]);
    expect(p.owedTotal).toBe(170_000);
  });
  it('Mai: được nhận từ Thiện', () => {
    const p = myPosition(plan, 'M');
    expect(p.net).toBe(380_000);
    expect(p.toReceive.map((t) => t.fromUserId)).toEqual(['T']);
  });
  it('người ngoài kế hoạch: số dư 0', () => {
    expect(myPosition(plan, 'X')).toMatchObject({ net: 0, toPay: [], toReceive: [], owedTotal: 0 });
  });
});

describe('transferRole', () => {
  it.each([
    ['H', 1, 'payer'],
    ['Q', 1, 'receiver'],
    ['T', 1, 'other'],
    ['T', 0, 'payer'],
    ['M', 0, 'receiver'],
  ] as const)('%s với giao dịch %i → %s', (me, index, role) => {
    expect(transferRole(plan.optimized[index], me)).toBe(role);
  });
});

describe('netSummary', () => {
  it('được nhận trước, cần trả sau, dạng gọn có dấu (Design.md ảnh 09)', () => {
    expect(netSummary(plan.members)).toBe('Mai +380k, Quân +170k, Hùng −170k, Thiện −380k');
  });
  it('bỏ người số dư 0', () => {
    expect(netSummary([m('a', 'An', 0), m('b', 'Bình', 5_000), m('c', 'Chi', -5_000)])).toBe('Bình +5k, Chi −5k');
  });
});

describe('graphLayout', () => {
  it('4 người: trái · dưới · trên · phải theo thứ tự vào nhà (Hùng trái, Thiện dưới, Mai trên, Quân phải như ảnh 09)', () => {
    const pos = graphLayout(['H', 'T', 'M', 'Q'], 280, 260);
    expect(pos.get('H')!.x).toBeLessThan(pos.get('Q')!.x);
    expect(pos.get('M')!.y).toBeLessThan(pos.get('T')!.y);
    expect(pos.get('H')!.y).toBe(pos.get('Q')!.y);
    expect(pos.get('M')!.x).toBe(pos.get('T')!.x);
  });
  it('n người bất kỳ: mọi node nằm trong khung và không trùng nhau', () => {
    for (const n of [1, 2, 3, 5, 8]) {
      const ids = Array.from({ length: n }, (_, i) => `u${i}`);
      const pos = graphLayout(ids, 280, 260);
      const pts = ids.map((id) => pos.get(id)!);
      expect(pts.every((p) => p.x >= 0 && p.x <= 280 && p.y >= 0 && p.y <= 260)).toBe(true);
      expect(new Set(pts.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`)).size).toBe(n);
    }
  });
});

describe('edgeGeometry', () => {
  it('rút ngắn hai đầu theo bán kính node, nhãn ở 40% từ người trả', () => {
    const g = edgeGeometry({ x: 0, y: 0 }, { x: 100, y: 0 }, 20);
    expect(g.x1).toBeCloseTo(20);
    expect(g.x2).toBeCloseTo(80 - 6);
    expect(g.labelX).toBeCloseTo(40);
    expect(g.labelY).toBeCloseTo(0);
  });
});
