import { describe, expect, it } from 'vitest';
import { withPinned } from './pinned.ts';

type T = { key: string; amount: number };
const keyOf = (t: T) => t.key;
const a = { key: 'thien-mai', amount: 380_000 };
const b = { key: 'hung-quan', amount: 170_000 };
const c = { key: 'quan-mai', amount: 50_000 };

describe('withPinned', () => {
  it('không ghim gì thì giữ nguyên danh sách', () => {
    const list = [a, b];
    expect(withPinned(list, new Map(), keyOf)).toBe(list);
  });

  it('dòng đang ghim vẫn hiện dù dữ liệu mới không còn nó, đúng vị trí cũ', () => {
    const pinned = new Map([[b.key, { item: b, index: 1 }]]);
    expect(withPinned([a, c], pinned, keyOf).map(keyOf)).toEqual(['thien-mai', 'hung-quan', 'quan-mai']);
  });

  it('dòng ghim còn trong dữ liệu thì không nhân đôi', () => {
    const pinned = new Map([[a.key, { item: a, index: 0 }]]);
    expect(withPinned([a, b], pinned, keyOf).map(keyOf)).toEqual(['thien-mai', 'hung-quan']);
  });

  it('vị trí cũ vượt quá độ dài thì đặt cuối', () => {
    const pinned = new Map([[c.key, { item: c, index: 5 }]]);
    expect(withPinned([a], pinned, keyOf).map(keyOf)).toEqual(['thien-mai', 'quan-mai']);
  });
});
