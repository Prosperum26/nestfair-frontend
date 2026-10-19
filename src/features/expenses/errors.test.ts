import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { isLedgerStale, ledgerErrorMessage } from './errors.ts';

describe('ledgerErrorMessage', () => {
  it('mã đã biết → câu tiếng Việt', () => {
    expect(ledgerErrorMessage(new ApiError(422, 'x', 'SPLIT_SUM_MISMATCH'))).toBe('Tổng các phần phải bằng số tiền hóa đơn.');
  });
  it('vượt số nợ: giữ câu backend vì có số tiền tối đa', () => {
    const msg = 'Số tiền tối đa có thể trả cho người này là 380.000đ.';
    expect(ledgerErrorMessage(new ApiError(422, msg, 'SETTLEMENT_AMOUNT_EXCEEDS_DEBT'))).toBe(msg);
  });
  it('mã lạ → thông điệp backend; không phải Error → câu chung', () => {
    expect(ledgerErrorMessage(new ApiError(400, 'Tên khoản chi cần từ 1 đến 80 ký tự.'))).toBe('Tên khoản chi cần từ 1 đến 80 ký tự.');
    expect(ledgerErrorMessage('boom')).toBe('Có lỗi xảy ra, thử lại sau.');
  });
  it('isLedgerStale', () => {
    expect(isLedgerStale(new ApiError(409, 'x', 'SETTLEMENT_NOT_PENDING'))).toBe(true);
    expect(isLedgerStale(new ApiError(422, 'x', 'SPLIT_INVALID'))).toBe(false);
  });
});
