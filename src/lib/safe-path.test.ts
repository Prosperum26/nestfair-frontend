import { describe, expect, it } from 'vitest';
import { safeInternalPath } from './safe-path.ts';

describe('safeInternalPath', () => {
  it('nhận đường dẫn nội bộ kèm query và hash', () => {
    expect(safeInternalPath('/expenses?month=2026-10#new')).toBe('/expenses?month=2026-10#new');
  });

  it.each([
    ['https://evil.example/x'],
    ['//evil.example'],
    ['/\\evil.example'],
    ['javascript:alert(1)'],
    ['expenses'],
    ['/a\nb'],
    [''],
    [42],
    [null],
    [undefined],
    [{ pathname: '/x' }],
  ])('từ chối %j', (value) => {
    expect(safeInternalPath(value)).toBeNull();
  });

  it('từ chối chuỗi quá dài', () => {
    expect(safeInternalPath('/' + 'a'.repeat(600))).toBeNull();
  });
});
