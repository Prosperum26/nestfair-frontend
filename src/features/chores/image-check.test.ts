import { describe, expect, it } from 'vitest';
import { MAX_PROOF_BYTES, validateProofImage } from './image-check.ts';

describe('validateProofImage', () => {
  it('jpeg, png, webp trong giới hạn thì hợp lệ', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validateProofImage({ type, size: 1_000_000 }), type).toBeNull();
    }
  });

  it('gif và định dạng khác bị từ chối với thông báo tiếng Việt', () => {
    expect(validateProofImage({ type: 'image/gif', size: 1000 })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');
    expect(validateProofImage({ type: '', size: 1000 })).toBe('Chỉ nhận ảnh JPG, PNG hoặc WEBP.');
  });

  it('đúng 5MB thì nhận, hơn 5MB một byte thì từ chối', () => {
    expect(validateProofImage({ type: 'image/png', size: MAX_PROOF_BYTES })).toBeNull();
    expect(validateProofImage({ type: 'image/png', size: MAX_PROOF_BYTES + 1 })).toBe('Ảnh tối đa 5MB.');
  });
});
