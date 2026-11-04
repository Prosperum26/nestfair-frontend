import { describe, expect, it } from 'vitest';
import { coverPhoto, groupPhotos, MAX_PHOTOS_PER_GROUP, missingGroups, PHOTO_CATEGORIES } from './photos.ts';
import type { ListingPhoto } from './types.ts';

const photo = (id: string, category: ListingPhoto['category'], sortOrder: number): ListingPhoto => ({
  id,
  category,
  sortOrder,
  url: `https://res.cloudinary.com/x/${id}.jpg`,
});

describe('hằng số nhóm ảnh', () => {
  it('3 nhóm theo thứ tự hiển thị, nhãn tiếng Việt, tối đa 6 ảnh mỗi nhóm', () => {
    expect(PHOTO_CATEGORIES).toEqual([
      { key: 'BEDROOM', label: 'Phòng ngủ' },
      { key: 'BATHROOM', label: 'Phòng vệ sinh' },
      { key: 'LIVING', label: 'Gian sinh hoạt' },
    ]);
    expect(MAX_PHOTOS_PER_GROUP).toBe(6);
  });
});

describe('groupPhotos', () => {
  it('gom đúng nhóm và sắp theo sortOrder', () => {
    const grouped = groupPhotos([
      photo('b2', 'BEDROOM', 2),
      photo('l0', 'LIVING', 0),
      photo('b0', 'BEDROOM', 0),
      photo('t0', 'BATHROOM', 0),
      photo('b1', 'BEDROOM', 1),
    ]);
    expect(grouped.BEDROOM.map((p) => p.id)).toEqual(['b0', 'b1', 'b2']);
    expect(grouped.BATHROOM.map((p) => p.id)).toEqual(['t0']);
    expect(grouped.LIVING.map((p) => p.id)).toEqual(['l0']);
  });

  it('luôn có đủ 3 khóa kể cả khi rỗng, và không sửa mảng đầu vào', () => {
    const input = [photo('b1', 'BEDROOM', 1), photo('b0', 'BEDROOM', 0)];
    const grouped = groupPhotos(input);
    expect(Object.keys(grouped)).toEqual(['BEDROOM', 'BATHROOM', 'LIVING']);
    expect(grouped.BATHROOM).toEqual([]);
    expect(input.map((p) => p.id)).toEqual(['b1', 'b0']);
  });
});

describe('missingGroups', () => {
  it('trả đúng các nhóm rỗng theo thứ tự cố định', () => {
    expect(missingGroups([])).toEqual(['BEDROOM', 'BATHROOM', 'LIVING']);
    expect(missingGroups([photo('t0', 'BATHROOM', 0)])).toEqual(['BEDROOM', 'LIVING']);
    expect(missingGroups([photo('b0', 'BEDROOM', 0), photo('t0', 'BATHROOM', 0), photo('l0', 'LIVING', 0)])).toEqual([]);
  });
});

describe('coverPhoto', () => {
  it('là ảnh Phòng ngủ có sortOrder nhỏ nhất', () => {
    expect(coverPhoto([photo('b1', 'BEDROOM', 1), photo('b0', 'BEDROOM', 0), photo('t0', 'BATHROOM', 0)])?.id).toBe('b0');
  });

  it('null khi nhóm Phòng ngủ rỗng, dù nhóm khác có ảnh', () => {
    expect(coverPhoto([photo('t0', 'BATHROOM', 0)])).toBeNull();
    expect(coverPhoto([])).toBeNull();
  });
});
