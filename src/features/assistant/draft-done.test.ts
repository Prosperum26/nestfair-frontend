import { describe, expect, it } from 'vitest';
import { draftKey, markDraftDone } from './draft-done.ts';

describe('draft-done', () => {
  it('ghép khóa theo tin nhắn và vị trí nút', () => {
    expect(draftKey('m1', 2)).toBe('m1:2');
  });

  it('đánh dấu hai lần cùng khóa không ném lỗi', () => {
    markDraftDone('m1:0');
    expect(() => markDraftDone('m1:0')).not.toThrow();
  });
});
