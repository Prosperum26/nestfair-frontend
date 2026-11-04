import { describe, expect, it } from 'vitest';
import { firstIndexOf, flattenGallery, galleryTabs, indexLabel, stepIndex } from './gallery.ts';

const p = (id: string) => ({ id, url: `https://img.test/${id}.jpg` });
const photos = {
  BEDROOM: [p('b1'), p('b2'), p('b3')],
  BATHROOM: [p('w1'), p('w2')],
  LIVING: [p('l1'), p('l2')],
};
const empty = { BEDROOM: [], BATHROOM: [], LIVING: [] };

describe('flattenGallery', () => {
  it('đúng thứ tự Phòng ngủ → Phòng vệ sinh → Gian sinh hoạt và đủ tổng số ảnh', () => {
    const flat = flattenGallery(photos);
    expect(flat.map((x) => x.id)).toEqual(['b1', 'b2', 'b3', 'w1', 'w2', 'l1', 'l2']);
    expect(flat).toHaveLength(7);
    expect(flat[0]).toEqual({ id: 'b1', url: 'https://img.test/b1.jpg', category: 'BEDROOM', label: 'Phòng ngủ 1' });
  });

  it('nhãn đánh số lại theo từng nhóm (dùng làm alt)', () => {
    const labels = flattenGallery(photos).map((x) => x.label);
    expect(labels).toEqual([
      'Phòng ngủ 1',
      'Phòng ngủ 2',
      'Phòng ngủ 3',
      'Phòng vệ sinh 1',
      'Phòng vệ sinh 2',
      'Gian sinh hoạt 1',
      'Gian sinh hoạt 2',
    ]);
  });

  it('không có ảnh nào thì mảng rỗng', () => {
    expect(flattenGallery(empty)).toEqual([]);
  });
});

describe('galleryTabs', () => {
  it('nhãn kèm số ảnh, theo thứ tự cố định', () => {
    expect(galleryTabs(photos)).toEqual([
      { key: 'BEDROOM', label: 'Phòng ngủ 3', count: 3 },
      { key: 'BATHROOM', label: 'Vệ sinh 2', count: 2 },
      { key: 'LIVING', label: 'Sinh hoạt 2', count: 2 },
    ]);
  });

  it('ẩn nhóm không có ảnh', () => {
    expect(galleryTabs({ ...empty, BEDROOM: [p('b1')], LIVING: [p('l1'), p('l2')] }).map((t) => t.key)).toEqual(['BEDROOM', 'LIVING']);
  });

  it('không có ảnh nào thì không có thẻ nhóm', () => {
    expect(galleryTabs(empty)).toEqual([]);
  });
});

describe('indexLabel', () => {
  it('hiện số thứ tự từ 1', () => {
    expect(indexLabel(0, 7)).toBe('1 / 7');
    expect(indexLabel(6, 7)).toBe('7 / 7');
  });
});

describe('stepIndex', () => {
  it('đi tới và lùi, vòng quanh ở hai đầu', () => {
    expect(stepIndex(0, 7, 1)).toBe(1);
    expect(stepIndex(6, 7, 1)).toBe(0);
    expect(stepIndex(0, 7, -1)).toBe(6);
    expect(stepIndex(3, 7, -1)).toBe(2);
  });

  it('không có ảnh thì ở vị trí 0', () => {
    expect(stepIndex(0, 0, 1)).toBe(0);
  });
});

describe('firstIndexOf', () => {
  it('vị trí ảnh đầu tiên của nhóm trong dãy phẳng', () => {
    const flat = flattenGallery(photos);
    expect(firstIndexOf(flat, 'BEDROOM')).toBe(0);
    expect(firstIndexOf(flat, 'BATHROOM')).toBe(3);
    expect(firstIndexOf(flat, 'LIVING')).toBe(5);
  });

  it('nhóm không có ảnh thì -1', () => {
    expect(firstIndexOf(flattenGallery({ ...empty, BEDROOM: [p('b1')] }), 'LIVING')).toBe(-1);
  });
});
