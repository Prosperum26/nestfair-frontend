import { describe, expect, it } from 'vitest';
import { AFTER_TRANSFERS, BEFORE_DEBTS, type PersonKey, total, type Transfer } from './debt-demo.ts';

/** Số dư ròng: dương là được nhận, âm là cần trả. Chỉ để kiểm số liệu minh họa nhất quán. */
function netBalances(transfers: readonly Transfer[]): Record<PersonKey, number> {
  const net: Record<PersonKey, number> = { H: 0, T: 0, M: 0, Q: 0 };
  for (const t of transfers) {
    net[t.from] -= t.amount;
    net[t.to] += t.amount;
  }
  return net;
}

describe('số liệu minh họa Nhà 12A (Design.md mục 7)', () => {
  it('6 khoản nợ chéo luân chuyển 640k', () => {
    expect(BEFORE_DEBTS).toHaveLength(6);
    expect(total(BEFORE_DEBTS)).toBe(640_000);
  });

  it('sau rút gọn còn 2 giao dịch 550k: Thiện → Mai 380k, Hùng → Quân 170k', () => {
    expect(AFTER_TRANSFERS).toEqual([
      { from: 'T', to: 'M', amount: 380_000 },
      { from: 'H', to: 'Q', amount: 170_000 },
    ]);
    expect(total(AFTER_TRANSFERS)).toBe(550_000);
  });

  it('số dư ròng trước và sau rút gọn giống hệt nhau (rút gọn không đổi ai nợ bao nhiêu)', () => {
    expect(netBalances(AFTER_TRANSFERS)).toEqual(netBalances(BEFORE_DEBTS));
  });

  it('tổng số dư ròng luôn bằng 0, Mai +380k, Quân +170k, Hùng −170k, Thiện −380k', () => {
    const net = netBalances(BEFORE_DEBTS);
    expect(Object.values(net).reduce((a, b) => a + b, 0)).toBe(0);
    expect(net).toEqual({ H: -170_000, T: -380_000, M: 380_000, Q: 170_000 });
  });
});
