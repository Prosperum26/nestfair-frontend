import { describe, expect, it } from 'vitest';
import { NODE_POS, NODE_RADIUS, edgeGeometry } from './graph.ts';

describe('edgeGeometry: đoạn nối hai nút sơ đồ nợ', () => {
  it('đầu mút nằm ngoài vòng tròn nút (không chạm tên người)', () => {
    const { x1, y1, x2, y2 } = edgeGeometry('H', 'Q');
    const dFrom = Math.hypot(x1 - NODE_POS.H.x, y1 - NODE_POS.H.y);
    const dTo = Math.hypot(x2 - NODE_POS.Q.x, y2 - NODE_POS.Q.y);
    expect(dFrom).toBeGreaterThan(NODE_RADIUS);
    expect(dTo).toBeGreaterThan(NODE_RADIUS);
  });

  it('nhãn tiền nằm trên đoạn nối, giữa hai nút', () => {
    const { labelX, labelY } = edgeGeometry('M', 'T');
    expect(labelX).toBeCloseTo(NODE_POS.M.x, 5);
    expect(labelY).toBeGreaterThan(NODE_POS.M.y);
    expect(labelY).toBeLessThan(NODE_POS.T.y);
  });

  it('chiều từ → đến quyết định hướng đoạn (mũi tên ở đầu đến)', () => {
    const a = edgeGeometry('T', 'M');
    expect(a.y1).toBeGreaterThan(a.y2);
  });
});
