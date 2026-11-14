import type { PersonKey } from './debt-demo.ts';

/** Sơ đồ nợ vẽ trong khung 200 × 200: Mai ở trên, Hùng trái, Quân phải, Thiện dưới. */
export const NODE_POS: Record<PersonKey, { x: number; y: number }> = {
  M: { x: 100, y: 28 },
  H: { x: 28, y: 100 },
  Q: { x: 172, y: 100 },
  T: { x: 100, y: 172 },
};

export const NODE_RADIUS = 18;
const GAP = 4;

/**
 * Đoạn nối từ → đến, rút ngắn cho khỏi chạm vòng tròn nút (mũi tên nằm ở đầu "đến").
 * Nhãn tiền đặt trên đoạn, lệch về phía `labelAt` (0 = gần "từ", 1 = gần "đến"; mặc định giữa đoạn).
 */
export function edgeGeometry(from: PersonKey, to: PersonKey, labelAt = 0.5) {
  const a = NODE_POS[from];
  const b = NODE_POS[to];
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const ux = (b.x - a.x) / len;
  const uy = (b.y - a.y) / len;
  const inset = NODE_RADIUS + GAP;
  return {
    x1: a.x + ux * inset,
    y1: a.y + uy * inset,
    x2: b.x - ux * inset,
    y2: b.y - uy * inset,
    labelX: a.x + (b.x - a.x) * labelAt,
    labelY: a.y + (b.y - a.y) * labelAt,
  };
}
