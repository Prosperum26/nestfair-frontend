import { describe, expect, it } from 'vitest';
import { nextConsentStep, ocrToggleLabel } from './consent.ts';

describe('nextConsentStep: bấm quét lần đầu thì hỏi, đã đồng ý thì đi tiếp', () => {
  it('chưa đồng ý (null) → hỏi; từ chối không lưu gì nên lần sau vẫn hỏi', () => {
    expect(nextConsentStep(null)).toBe('ask');
  });

  it('đã đồng ý (có mốc thời gian) → đi tiếp, không hỏi lại', () => {
    expect(nextConsentStep('2026-10-20T03:00:00.000Z')).toBe('proceed');
  });
});

describe('ocrToggleLabel: trạng thái hiển thị ở menu tài khoản', () => {
  it('Bật khi đã đồng ý, Tắt khi chưa', () => {
    expect(ocrToggleLabel('2026-10-20T03:00:00.000Z')).toBe('Bật');
    expect(ocrToggleLabel(null)).toBe('Tắt');
  });
});
