import { firstName } from '@/lib/date.ts';
import { formatShortVnd } from '@/lib/format.ts';
import type { PlanMember, PlanTransfer, SettlementPlan } from './types.ts';

/** Vị trí của người đang xem trong kế hoạch: số dư ròng, khoản cần trả, khoản được nhận. */
export function myPosition(plan: SettlementPlan, meId: string | undefined) {
  const net = plan.members.find((x) => x.id === meId)?.net ?? 0;
  const toPay = plan.optimized.filter((t) => t.fromUserId === meId);
  const toReceive = plan.optimized.filter((t) => t.toUserId === meId);
  return { net, toPay, toReceive, owedTotal: toPay.reduce((s, t) => s + t.amount, 0) };
}

export type TransferRole = 'payer' | 'receiver' | 'other';

export function transferRole(t: PlanTransfer, meId: string | undefined): TransferRole {
  if (t.fromUserId === meId) return 'payer';
  if (t.toUserId === meId) return 'receiver';
  return 'other';
}

/** "Mai +380k, Quân +170k, Hùng −170k, Thiện −380k": người được nhận trước, bỏ người số dư 0. */
export function netSummary(members: PlanMember[]): string {
  return members
    .filter((x) => x.net !== 0)
    .sort((a, b) => b.net - a.net)
    .map((x) => `${firstName(x.fullName)} ${x.net > 0 ? '+' : ''}${formatShortVnd(x.net)}`)
    .join(', ');
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Vị trí node sơ đồ rút gọn nợ trong khung `width × height`. 4 người dùng bố cục của ảnh 09
 * (trái · dưới · trên · phải theo thứ tự vào nhà, nên Hùng trái, Thiện dưới, Mai trên, Quân phải);
 * số người khác xếp đều trên vòng tròn, bắt đầu từ bên trái.
 */
export function graphLayout(ids: readonly string[], width: number, height: number, pad = 34): Map<string, Point> {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width / 2 - pad;
  const ry = height / 2 - pad;
  const pos = new Map<string, Point>();
  if (ids.length === 4) {
    const slots: Point[] = [
      { x: cx - rx, y: cy },
      { x: cx, y: cy + ry },
      { x: cx, y: cy - ry },
      { x: cx + rx, y: cy },
    ];
    ids.forEach((id, i) => pos.set(id, slots[i]));
    return pos;
  }
  if (ids.length === 1) {
    pos.set(ids[0], { x: cx, y: cy });
    return pos;
  }
  ids.forEach((id, i) => {
    const angle = Math.PI + (2 * Math.PI * i) / ids.length;
    pos.set(id, { x: cx + rx * Math.cos(angle), y: cy - ry * Math.sin(angle) });
  });
  return pos;
}

/**
 * Đoạn thẳng nối hai node, rút ngắn theo bán kính node (đầu đích chừa thêm chỗ cho mũi tên),
 * nhãn đặt ở 40% từ người trả để hai cạnh cắt nhau ở giữa không đè nhãn lên nhau.
 */
export function edgeGeometry(from: Point, to: Point, radius: number, arrowGap = 6) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    x1: from.x + ux * radius,
    y1: from.y + uy * radius,
    x2: to.x - ux * (radius + arrowGap),
    y2: to.y - uy * (radius + arrowGap),
    labelX: from.x + dx * 0.4,
    labelY: from.y + dy * 0.4,
  };
}
