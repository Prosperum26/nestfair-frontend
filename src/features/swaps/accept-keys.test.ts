import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api.ts';
import { createKeyBook, shouldReleaseKey } from './accept-keys.ts';

describe('createKeyBook', () => {
  it('bấm lại cùng một yêu cầu thì dùng lại đúng key cũ', () => {
    let n = 0;
    const book = createKeyBook(() => `k${++n}`);
    expect(book.keyFor('a')).toBe('k1');
    expect(book.keyFor('a')).toBe('k1');
  });

  it('mỗi yêu cầu có key riêng', () => {
    let n = 0;
    const book = createKeyBook(() => `k${++n}`);
    expect(book.keyFor('a')).toBe('k1');
    expect(book.keyFor('b')).toBe('k2');
  });

  it('sau release thì lần sau là key mới', () => {
    let n = 0;
    const book = createKeyBook(() => `k${++n}`);
    book.keyFor('a');
    book.release('a');
    expect(book.keyFor('a')).toBe('k2');
  });
});

describe('shouldReleaseKey', () => {
  it('lỗi 4xx do máy chủ trả về là kết quả dứt khoát: bỏ key', () => {
    expect(shouldReleaseKey(new ApiError(409, 'x', 'SWAP_ALREADY_ACCEPTED'))).toBe(true);
    expect(shouldReleaseKey(new ApiError(422, 'x', 'NOT_ELIGIBLE'))).toBe(true);
  });

  it('mất mạng (statusCode 0) hoặc 5xx chưa biết máy chủ đã xử lý chưa: giữ key để thử lại', () => {
    expect(shouldReleaseKey(new ApiError(0, 'Không kết nối được máy chủ'))).toBe(false);
    expect(shouldReleaseKey(new ApiError(502, 'x'))).toBe(false);
    expect(shouldReleaseKey(new Error('boom'))).toBe(false);
  });
});
