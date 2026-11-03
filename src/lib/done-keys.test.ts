import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDoneKeys } from './done-keys.ts';

describe('createDoneKeys', () => {
  let store: Map<string, string>;
  beforeEach(() => {
    store = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('mark thêm khóa và lưu vào localStorage theo storageKey', () => {
    const keys = createDoneKeys('test.done.a');
    keys.mark('m1:0');
    expect(keys.snapshot()).toEqual(['m1:0']);
    expect(JSON.parse(store.get('test.done.a') ?? '[]')).toEqual(['m1:0']);
  });

  it('mark hai lần cùng khóa chỉ lưu một lần và không báo thay đổi lần hai', () => {
    const keys = createDoneKeys('test.done.b');
    let calls = 0;
    keys.subscribe(() => (calls += 1));
    keys.mark('m1:0');
    keys.mark('m1:0');
    expect(keys.snapshot()).toEqual(['m1:0']);
    expect(calls).toBe(1);
  });

  it('đọc lại được khóa đã lưu và bỏ qua dữ liệu hỏng', () => {
    store.set('test.done.c', JSON.stringify(['a', 3, 'b']));
    expect(createDoneKeys('test.done.c').snapshot()).toEqual(['a', 'b']);
    store.set('test.done.d', '{không phải json');
    expect(createDoneKeys('test.done.d').snapshot()).toEqual([]);
  });

  it('hai kho khác storageKey không lẫn nhau', () => {
    const a = createDoneKeys('test.done.e');
    const b = createDoneKeys('test.done.f');
    a.mark('x');
    expect(b.snapshot()).toEqual([]);
  });

  it('chỉ giữ 200 khóa mới nhất', () => {
    const keys = createDoneKeys('test.done.g');
    for (let i = 0; i < 205; i += 1) keys.mark(`k${i}`);
    expect(keys.snapshot()).toHaveLength(200);
    expect(keys.snapshot()[0]).toBe('k5');
  });
});
