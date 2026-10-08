import { describe, expect, it } from 'vitest';
import { passwordStrength } from './password-strength.ts';

describe('passwordStrength', () => {
  it.each([
    ['', 0],
    ['Ab1', 1],
    ['abcdefgh', 1],
    ['abcdefgH', 2],
    ['MatKhau123', 3],
    ['MatKhau123!', 4],
    ['MatKhauRatDai123', 4],
  ])('"%s" -> %i', (password, score) => {
    expect(passwordStrength(password)).toBe(score);
  });
});
