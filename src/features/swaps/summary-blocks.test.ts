import { describe, expect, it } from 'vitest';
import { debtText, incomingText, marketText } from './summary-blocks.ts';

describe('incomingText', () => {
  it('không có yêu cầu nào', () => {
    expect(incomingText(0)).toBe('Chưa có yêu cầu nào chờ bạn trả lời');
  });

  it('có yêu cầu chờ bạn', () => {
    expect(incomingText(1)).toBe('1 yêu cầu chờ bạn trả lời');
    expect(incomingText(3)).toBe('3 yêu cầu chờ bạn trả lời');
  });
});

describe('marketText', () => {
  it('Chợ ca trống hoặc có ca cần người nhận', () => {
    expect(marketText(0)).toBe('Chợ ca đang trống');
    expect(marketText(2)).toBe('2 ca đang cần người nhận');
  });
});

describe('debtText', () => {
  it('chưa có nợ ca', () => {
    expect(debtText(0, 0)).toBe('Chưa có nợ ca nào');
  });

  it('một chiều', () => {
    expect(debtText(2, 0)).toBe('Bạn nợ 2 khoản');
    expect(debtText(0, 1)).toBe('1 khoản nợ bạn');
  });

  it('hai chiều giữ riêng, không bù trừ', () => {
    expect(debtText(2, 1)).toBe('Bạn nợ 2 khoản · 1 khoản nợ bạn');
  });
});
