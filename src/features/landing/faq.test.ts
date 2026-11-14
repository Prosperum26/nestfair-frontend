import { describe, expect, it } from 'vitest';
import { FAQ_ITEMS, nextOpenIndex } from './faq.ts';

describe('nextOpenIndex: accordion hỏi đáp chỉ mở một câu', () => {
  it('bấm câu đang đóng thì mở câu đó và đóng câu khác', () => {
    expect(nextOpenIndex(0, 2)).toBe(2);
    expect(nextOpenIndex(null, 1)).toBe(1);
  });

  it('bấm lại câu đang mở thì đóng', () => {
    expect(nextOpenIndex(1, 1)).toBeNull();
  });
});

describe('FAQ_ITEMS', () => {
  it('có đủ 4 câu, mỗi câu có hỏi và đáp không rỗng', () => {
    expect(FAQ_ITEMS).toHaveLength(4);
    for (const item of FAQ_ITEMS) {
      expect(item.question.trim()).not.toBe('');
      expect(item.answer.trim()).not.toBe('');
    }
  });

  it('câu hỏi không trùng nhau', () => {
    expect(new Set(FAQ_ITEMS.map((i) => i.question)).size).toBe(FAQ_ITEMS.length);
  });
});
