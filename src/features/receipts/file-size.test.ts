import { describe, expect, it } from 'vitest';
import { formatFileSize } from './file-size.ts';

describe('formatFileSize', () => {
  it('một chữ số thập phân, dấu phẩy', () => {
    expect(formatFileSize(838_861)).toBe('0,8MB');
    expect(formatFileSize(1_048_576)).toBe('1,0MB');
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5,0MB');
  });
  it('ảnh rất nhỏ vẫn có số', () => {
    expect(formatFileSize(4_000)).toBe('0,0MB');
  });
});
