import { describe, expect, it } from 'vitest';
import { formatVnd } from './format.ts';

describe('formatVnd', () => {
  it.each([
    [0, '0đ'],
    [840000, '840.000đ'],
    [2280000, '2.280.000đ'],
    [999, '999đ'],
    [-170000, '−170.000đ'],
  ])('%i -> %s', (amount, expected) => {
    expect(formatVnd(amount)).toBe(expected);
  });
});
