/** Một món trên màn xác nhận hóa đơn: tiền dòng (có thể đang trống khi người dùng sửa) và những người dùng món đó. */
export interface ItemAssignment {
  lineTotal: number | null;
  userIds: readonly string[];
}

export interface ItemizedPreview {
  /** Phần của từng người, theo thứ tự thành viên; chỉ gồm người có phần món > 0. */
  shares: { userId: string; amount: number }[];
  /** Σ tiền các món hợp lệ. */
  itemsSum: number;
  /** total − itemsSum: dương là phí, âm là giảm giá; được chia theo tỷ lệ tiền món. 0 nếu chưa có tổng. */
  diff: number;
  /** Chỉ số các món hợp lệ nhưng chưa gán cho ai (chặn lưu). */
  unassigned: number[];
  /** Chỉ số các món có tiền rỗng, ≤ 0 hoặc không nguyên (chặn lưu, không tính vào phần chia). */
  invalid: number[];
  /** Đủ điều kiện lưu: có tổng, có món, mọi món hợp lệ và đã gán, Σ phần chia đúng bằng tổng. */
  ok: boolean;
}

const isMoney = (n: number | null): n is number => n !== null && Number.isSafeInteger(n) && n > 0;

/** Chia đều `total` cho `users` (giữ thứ tự), dư cộng lần lượt 1đ từ đầu danh sách. */
function splitEqual(total: number, users: readonly string[]) {
  const base = Math.floor(total / users.length);
  const remainder = total - base * users.length;
  return users.map((userId, i) => ({ userId, amount: base + (i < remainder ? 1 : 0) }));
}

/**
 * Phần chia theo món xem trước trên màn xác nhận hóa đơn, cùng thuật toán với backend
 * (`expenses/algorithms/split.ts: splitItemized`, cùng vector kiểm thử):
 * 1. mỗi món chia đều cho người dùng nó, dư 1đ cho người đứng đầu `memberIds`;
 * 2. phần chênh `total − Σ món` chia theo tỷ lệ tiền món của từng người, tính bằng BigInt vì tích có thể vượt 2^53;
 * 3. phần dư khi phân bổ chia lần lượt 1đ từ đầu danh sách, nên Σ phần chia đúng bằng `total`.
 *
 * Khi chưa hợp lệ (món chưa gán, tiền món trống, chưa có tổng) vẫn trả số đang gán (chưa phân bổ phần chênh)
 * để người dùng thấy tổng tạm của từng người, kèm `ok = false`. Không ném lỗi.
 */
export function previewItemized({
  total,
  items,
  memberIds,
}: {
  total: number | null;
  items: readonly ItemAssignment[];
  memberIds: readonly string[];
}): ItemizedPreview {
  const invalid: number[] = [];
  const unassigned: number[] = [];
  const firstSeen = new Map<string, number>();
  let itemsSum = 0;

  items.forEach((item, index) => {
    if (!isMoney(item.lineTotal)) {
      invalid.push(index);
      return;
    }
    itemsSum += item.lineTotal;
    if (item.userIds.length === 0) unassigned.push(index);
    for (const u of item.userIds) if (!firstSeen.has(u)) firstSeen.set(u, firstSeen.size);
  });

  const priority = (u: string) => {
    const i = memberIds.indexOf(u);
    return i === -1 ? memberIds.length + (firstSeen.get(u) ?? 0) : i;
  };
  const ranked = [...firstSeen.keys()].sort((a, b) => priority(a) - priority(b));
  const position = new Map(ranked.map((u, i) => [u, i] as const));

  const base = new Map<string, number>();
  for (const item of items) {
    if (!isMoney(item.lineTotal) || item.userIds.length === 0) continue;
    const users = [...new Set(item.userIds)].sort((a, b) => (position.get(a) ?? 0) - (position.get(b) ?? 0));
    for (const { userId, amount } of splitEqual(item.lineTotal, users)) base.set(userId, (base.get(userId) ?? 0) + amount);
  }
  const payers = ranked.filter((u) => (base.get(u) ?? 0) > 0);
  const baseShares = payers.map((userId) => ({ userId, amount: base.get(userId) ?? 0 }));

  const hasTotal = total !== null && Number.isSafeInteger(total) && total > 0;
  const diff = total === null ? 0 : total - itemsSum;
  const complete = hasTotal && items.length > 0 && invalid.length === 0 && unassigned.length === 0 && payers.length > 0;
  if (!complete) return { shares: baseShares, itemsSum, diff, unassigned, invalid, ok: false };

  const magnitude = BigInt(Math.abs(diff));
  const sign = diff < 0 ? -1 : 1;
  const adjust = new Map(payers.map((u) => [u, Number((magnitude * BigInt(base.get(u) ?? 0)) / BigInt(itemsSum))] as const));
  let remainder = Math.abs(diff) - [...adjust.values()].reduce((s, a) => s + a, 0);
  const shares = payers.map((userId) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder -= extra;
    return { userId, amount: (base.get(userId) ?? 0) + sign * ((adjust.get(userId) ?? 0) + extra) };
  });

  const ok = shares.every((s) => s.amount >= 0) && shares.reduce((s, x) => s + x.amount, 0) === total;
  return { shares, itemsSum, diff, unassigned, invalid, ok };
}
